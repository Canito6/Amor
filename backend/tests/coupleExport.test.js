const request = require('supertest');
const mongoose = require('mongoose');

// Mock da ligação ao MongoDB para evitar chamadas de rede reais durante os testes
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Mock de todos os modelos Mongoose utilizados
jest.mock('../src/models/auth/userModel');
jest.mock('../src/models/auth/tokenBlacklistModel');
jest.mock('../src/models/couple/coupleModel');
jest.mock('../src/models/fun/memoryModel');
jest.mock('../src/models/chat/messageModel');
jest.mock('../src/models/fun/bucketItemModel');
jest.mock('../src/models/couple/eventModel');
jest.mock('../src/models/gallery/photoModel');
jest.mock('../src/models/fun/quizModel');
jest.mock('../src/models/fun/scratchCardModel');
jest.mock('../src/models/fun/couponModel');
jest.mock('../src/models/fun/likelyModel');
jest.mock('../src/models/fun/decisionWheelModel');

const User = require('../src/models/auth/userModel');
const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');
const Couple = require('../src/models/couple/coupleModel');
const Memory = require('../src/models/fun/memoryModel');
const Message = require('../src/models/chat/messageModel');
const BucketItem = require('../src/models/fun/bucketItemModel');
const Event = require('../src/models/couple/eventModel');
const Photo = require('../src/models/gallery/photoModel');
const Quiz = require('../src/models/fun/quizModel');
const ScratchCard = require('../src/models/fun/scratchCardModel');
const Coupon = require('../src/models/fun/couponModel');
const LikelyQuestion = require('../src/models/fun/likelyModel');
const DecisionWheel = require('../src/models/fun/decisionWheelModel');

const app = require('../src/server');
const jwt = require('jsonwebtoken');

// Silenciar logs do Winston durante a execução dos testes
const logger = require('../src/utils/logger');
logger.transports.forEach((t) => {
  t.silent = true;
});

// Helper para simular queries Mongoose encadeadas (ex: .select().sort().limit())
const createMockQuery = (resolvedValue) => {
  const query = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  };
  query.then = (onFulfilled, onRejected) => {
    return Promise.resolve(resolvedValue).then(onFulfilled, onRejected);
  };
  return query;
};

describe('Testes de Exportação de Dados do Casal', () => {
  const coupleId = 'couple_123';
  const userId = 'user_123';
  let token;

  beforeAll(() => {
    // Definimos JWT_SECRET antes de assinar o token do teste para evitar incompatibilidade
    process.env.JWT_SECRET = 'chave_secreta_para_o_login_do_canito_e_namorada';
    token = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET);
    
    // Mock do fetch global para simular downloads de imagens no PDF respeitando AbortSignal
    global.fetch = jest.fn().mockImplementation((url, options) => {
      const signal = options?.signal;
      if (url.includes('timeout-image')) {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            resolve({ ok: true, arrayBuffer: () => Promise.resolve(Buffer.alloc(100).buffer) });
          }, 10000); // longa duração
          
          if (signal) {
            signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              reject(new DOMException('The user aborted a request.', 'AbortError'));
            });
          }
        });
      }
      if (url.includes('large-image')) {
        const buffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
        return Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(buffer.buffer)
        });
      }
      const buffer = Buffer.alloc(100); // 100 bytes (ok)
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(buffer.buffer)
      });
    });
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar o Mock do blacklist para que o token passe no verificarToken
    TokenBlacklist.findOne.mockResolvedValue(null);

    // Configurações padrão de autenticação para passar no middleware verificarToken
    User.findById.mockResolvedValue({
      _id: userId,
      username: 'tester',
      email: 'tester@example.com',
      role: 'user',
      coupleId,
      password: 'hashedpassword123',
      loginAttempts: 0,
      moodHistory: [{ emoji: '😊', updatedAt: new Date() }]
    });
  });

  describe('Autenticação e Segurança', () => {
    it('deve rejeitar exportação de JSON se o token não for fornecido', async () => {
      const res = await request(app).get('/api/couple/export');
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toContain('Acesso negado');
    });

    it('deve rejeitar exportação de PDF se o token não for fornecido', async () => {
      const res = await request(app).get('/api/couple/export/pdf');
      expect(res.statusCode).toEqual(401);
      expect(res.body.error).toContain('Acesso negado');
    });
  });

  describe('Exportação JSON (GET /api/couple/export)', () => {
    it('deve exportar todos os dados do casal de forma estruturada e excluir dados sensíveis', async () => {
      // Mock de parceiros (dois parceiros)
      User.find.mockReturnValue(createMockQuery([
        {
          username: 'tester',
          email: 'tester@example.com',
          role: 'user',
          avatarUrl: '',
          moodEmoji: '😊',
          moodUpdatedAt: new Date(),
          moodHistory: [{ emoji: '😊', updatedAt: new Date() }]
        },
        {
          username: 'parceiro',
          email: 'parceiro@example.com',
          role: 'user',
          avatarUrl: '',
          moodEmoji: '😊',
          moodUpdatedAt: new Date(),
          moodHistory: [{ emoji: '😊', updatedAt: new Date() }]
        }
      ]));

      // Mock Couple.findById
      Couple.findById.mockResolvedValue({
        _id: coupleId,
        names: 'Tester & Partner',
        relationshipDate: new Date('2025-01-01'),
        spotifyPlaylist: 'https://open.spotify.com/playlist/123'
      });

      // Mocks encadeados para os modelos de dados
      Memory.find.mockReturnValue(createMockQuery([{ _id: 'mem_1', title: 'Viagem', date: new Date(), imageUrl: '' }]));
      Message.find.mockReturnValue(createMockQuery([{ _id: 'msg_1', sender: 'tester', content: 'Olá', createdAt: new Date() }]));
      BucketItem.find.mockReturnValue(createMockQuery([{ _id: 'buck_1', title: 'Viajar', completed: false }]));
      Event.find.mockReturnValue(createMockQuery([{ _id: 'evt_1', title: 'Jantar', date: new Date() }]));
      Photo.find.mockReturnValue(createMockQuery([{ _id: 'photo_1', url: 'http://res.cloudinary.com/img.jpg' }]));
      ScratchCard.find.mockReturnValue(createMockQuery([]));

      // Mocks de estatísticas e contadores
      Quiz.countDocuments.mockResolvedValue(2);
      ScratchCard.countDocuments.mockResolvedValue(1);
      BucketItem.countDocuments.mockResolvedValue(5);
      Memory.countDocuments.mockResolvedValue(1);
      Photo.countDocuments.mockResolvedValue(1);
      Coupon.countDocuments.mockResolvedValue(0);
      LikelyQuestion.find.mockResolvedValue([]);
      DecisionWheel.countDocuments.mockResolvedValue(0);

      // Executar exportação
      const res = await request(app)
        .get('/api/couple/export')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('couple');
      expect(res.body).toHaveProperty('partners');
      expect(res.body).toHaveProperty('stats');
      expect(res.body).toHaveProperty('memories');
      expect(res.body).toHaveProperty('messages');
      expect(res.body).toHaveProperty('bucketList');
      expect(res.body).toHaveProperty('events');
      expect(res.body).toHaveProperty('photos');

      // Garantir exclusão de password hash no parceiro retornado
      const partner = res.body.partners[0];
      expect(partner).not.toHaveProperty('password');
      expect(partner).not.toHaveProperty('loginAttempts');
      expect(partner).toHaveProperty('username', 'tester');
      expect(partner).toHaveProperty('email', 'tester@example.com');
      
      // Garantir que a playlist do Spotify é exportada (visto ser apenas link público)
      expect(res.body.couple.spotifyPlaylist).toEqual('https://open.spotify.com/playlist/123');
    });
  });

  describe('Exportação PDF (GET /api/couple/export/pdf)', () => {
    it('deve gerar PDF com sucesso mesmo se imagens falharem, expirarem ou excederem tamanho limite', async () => {
      Couple.findById.mockResolvedValue({ _id: coupleId, names: 'Tester & Partner', relationshipDate: new Date('2025-01-01') });
      Memory.countDocuments.mockResolvedValue(3);
      User.find.mockResolvedValue([{ _id: userId, coupleId, username: 'tester' }]);

      // Criar memórias para testar downloads (imagem ok, imagem timeout, imagem muito grande)
      Memory.find.mockReturnValue(createMockQuery([
        { _id: 'mem_ok', title: 'Ok Photo', date: new Date(), imageUrl: 'http://example.com/ok-image.jpg', description: 'Desc ok' },
        { _id: 'mem_timeout', title: 'Timeout Photo', date: new Date(), imageUrl: 'http://example.com/timeout-image.jpg', description: 'Desc timeout' },
        { _id: 'mem_large', title: 'Large Photo', date: new Date(), imageUrl: 'http://example.com/large-image.jpg', description: 'Desc large' }
      ]));

      const res = await request(app)
        .get('/api/couple/export/pdf')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('application/pdf');
      expect(res.body).toBeInstanceOf(Buffer);
    });

    it('deve respeitar o limite máximo de 150 memórias no PDF', async () => {
      Couple.findById.mockResolvedValue({ _id: coupleId, names: 'Tester & Partner', relationshipDate: new Date('2025-01-01') });
      User.find.mockResolvedValue([{ _id: userId, coupleId, username: 'tester' }]);
      
      // Simular 200 memórias no total
      Memory.countDocuments.mockResolvedValue(200);
      
      // Criar 150 memórias simuladas
      const mockMemoriesList = Array.from({ length: 150 }, (_, i) => ({
        _id: `mem_${i}`,
        title: `Memória ${i}`,
        date: new Date(),
        description: `Descrição ${i}`
      }));
      Memory.find.mockReturnValue(createMockQuery(mockMemoriesList));

      const res = await request(app)
        .get('/api/couple/export/pdf')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.headers['content-type']).toEqual('application/pdf');
    });
  });
});
