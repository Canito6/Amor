const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const webpush = require('web-push');
const eventBus = require('../src/utils/eventBus');

// Mock web-push
jest.mock('web-push');

// Mock database connection
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

const app = require('../src/server');

// Models
const User = require('../src/models/auth/userModel');
const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');
const PushSubscription = require('../src/models/auth/pushSubscriptionModel');

jest.mock('../src/models/auth/userModel');
jest.mock('../src/models/auth/tokenBlacklistModel');
jest.mock('../src/models/auth/pushSubscriptionModel');

describe('Push Notifications API & Events', () => {
  const mockToken = 'mock_jwt_token';
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockCoupleId = 'couple_123';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreta_teste_jwt';
    process.env.VAPID_PUBLIC_KEY = 'mock_public_key';
    process.env.VAPID_PRIVATE_KEY = 'mock_private_key';

    TokenBlacklist.findOne.mockResolvedValue(null);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUserId, username: 'maria', role: 'user' });
    User.findById.mockResolvedValue({ _id: mockUserId, username: 'maria', coupleId: mockCoupleId });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/auth/vapid-public-key', () => {
    it('deve devolver a chave pública VAPID com sucesso', async () => {
      const res = await request(app)
        .get('/api/auth/vapid-public-key')
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.publicKey).toEqual('mock_public_key');
    });
  });

  describe('POST /api/auth/push-subscribe (idempotência - Correção 1)', () => {
    it('deve fazer upsert da subscrição de forma idempotente', async () => {
      const mockSub = {
        endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAA...',
        keys: {
          p256dh: 'BPHQD5c...',
          auth: 'wSzq...'
        }
      };

      // Mock update to return a mock document
      PushSubscription.findOneAndUpdate.mockResolvedValue({
        _id: 'sub_id_123',
        userId: mockUserId,
        ...mockSub
      });

      const res = await request(app)
        .post('/api/auth/push-subscribe')
        .set('Cookie', [`token=${mockToken}`])
        .send(mockSub);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('registada com sucesso');

      expect(PushSubscription.findOneAndUpdate).toHaveBeenCalledWith(
        { endpoint: mockSub.endpoint },
        { userId: mockUserId, endpoint: mockSub.endpoint, keys: mockSub.keys },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });
  });

  describe('POST /api/auth/push-unsubscribe', () => {
    it('deve remover a subscrição com sucesso', async () => {
      PushSubscription.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const res = await request(app)
        .post('/api/auth/push-unsubscribe')
        .set('Cookie', [`token=${mockToken}`])
        .send({ endpoint: 'https://mock.endpoint' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('removida com sucesso');
      expect(PushSubscription.deleteOne).toHaveBeenCalledWith({
        endpoint: 'https://mock.endpoint',
        userId: mockUserId
      });
    });
  });

  describe('Eventos e Disparo de Push Notifications (Assíncrono)', () => {
    it('deve disparar notificação push para o outro parceiro no casal quando uma mensagem é criada', async () => {
      const mockPartner = {
        _id: new mongoose.Types.ObjectId().toString(),
        username: 'joao',
        coupleId: mockCoupleId
      };

      const mockSubscriptions = [
        {
          _id: 'sub_partner',
          endpoint: 'https://push.firefox.com/123',
          keys: { auth: 'auth_key', p256dh: 'p256dh_key' }
        }
      ];

      // Mock encontrar o destinatário (o parceiro 'joao' que não é a remetente 'maria')
      User.findOne.mockResolvedValue(mockPartner);

      // Mock encontrar subscrições do parceiro
      PushSubscription.find.mockResolvedValue(mockSubscriptions);

      // Configurar mock do webpush
      webpush.sendNotification.mockResolvedValue({});

      // Simular emissão do evento do chat
      eventBus.emit('socket:emit-update', {
        room: mockCoupleId,
        type: 'mensagem-created',
        user: 'maria',
        value: 'Olá amor!'
      });

      // Esperar brevemente que as promessas em background executem
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verificar que o parceiro destinatário foi procurado de forma correta
      expect(User.findOne).toHaveBeenCalledWith({
        coupleId: mockCoupleId,
        username: { $ne: 'maria' }
      });

      // Verificar que as subscrições do joao foram obtidas
      expect(PushSubscription.find).toHaveBeenCalledWith({
        userId: mockPartner._id
      });

      // Verificar que o push foi disparado com o payload genérico
      expect(webpush.sendNotification).toHaveBeenCalled();
      const firstCallArgs = webpush.sendNotification.mock.calls[0];
      expect(firstCallArgs[0].endpoint).toEqual(mockSubscriptions[0].endpoint);
      
      const payload = JSON.parse(firstCallArgs[1]);
      expect(payload.title).toContain('Nova mensagem recebida');
      expect(payload.body).toContain('Tens uma nova mensagem no teu Cantinho');
      expect(payload.url).toEqual('/mensagens');
    });
  });
});
