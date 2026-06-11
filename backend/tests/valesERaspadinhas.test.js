const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock da ligação ao MongoDB
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

const app = require('../src/server');

// Mock dos modelos de autenticação
const User = require('../src/models/auth/userModel');
const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');

// Mock dos modelos de fun (usados pelos repositories/controllers via DI)
const Coupon = require('../src/models/fun/couponModel');
const ScratchCard = require('../src/models/fun/scratchCardModel');

jest.mock('../src/models/auth/userModel');
jest.mock('../src/models/auth/tokenBlacklistModel');
jest.mock('../src/models/fun/couponModel');
jest.mock('../src/models/fun/scratchCardModel');

describe('Vales (Coupons) API Tests', () => {
  const mockToken = 'mock_token_jwt';
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockCoupleId = 'test_couple_456';

  const mockUser = {
    _id: mockUserId,
    username: 'maria',
    email: 'maria@example.com',
    role: 'user',
    coupleId: mockCoupleId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreta_teste_jwt';

    TokenBlacklist.findOne.mockResolvedValue(null);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUserId, username: 'maria', role: 'user' });
    User.findById.mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // -------------------------------------------------------
  // GET /api/fun/coupons
  // -------------------------------------------------------
  describe('GET /api/fun/coupons', () => {
    it('deve devolver uma lista de vales do casal', async () => {
      const mockCoupons = [
        { _id: '1', title: 'Vale um jantar', status: 'gifted', coupleId: mockCoupleId },
        { _id: '2', title: 'Vale uma massagem', status: 'redeemed', coupleId: mockCoupleId },
      ];

      Coupon.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCoupons),
      });

      const res = await request(app)
        .get('/api/fun/coupons')
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
    });

    it('deve devolver lista vazia quando não há vales', async () => {
      Coupon.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app)
        .get('/api/fun/coupons')
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([]);
    });

    it('deve rejeitar pedido sem autenticação', async () => {
      const res = await request(app).get('/api/fun/coupons');
      expect(res.statusCode).toEqual(401);
    });
  });

  // -------------------------------------------------------
  // POST /api/fun/coupons
  // -------------------------------------------------------
  describe('POST /api/fun/coupons', () => {
    it('deve criar um vale com sucesso', async () => {
      const newCoupon = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Vale um fim de semana especial',
        description: 'Escolhe o destino',
        icon: '🎟️',
        coupleId: mockCoupleId,
        createdBy: 'maria',
        status: 'gifted',
      };

      Coupon.create = jest.fn().mockResolvedValue(newCoupon);

      const res = await request(app)
        .post('/api/fun/coupons')
        .send({
          title: 'Vale um fim de semana especial',
          description: 'Escolhe o destino',
          icon: '🎟️',
        })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBe('Vale um fim de semana especial');
    });

    it('deve falhar se o título estiver em falta (validação Zod)', async () => {
      const res = await request(app)
        .post('/api/fun/coupons')
        .send({ description: 'Sem título', icon: '🎟️' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(400);
    });
  });

  // -------------------------------------------------------
  // PATCH /api/fun/coupons/:id/redeem
  // -------------------------------------------------------
  describe('PATCH /api/fun/coupons/:id/redeem', () => {
    it('deve resgatar um vale disponível com sucesso', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCoupon = {
        _id: mockId,
        title: 'Vale um jantar',
        coupleId: mockCoupleId,
        status: 'gifted',
        save: jest.fn().mockResolvedValue({}),
      };

      Coupon.findById = jest.fn().mockResolvedValue(mockCoupon);

      const res = await request(app)
        .patch(`/api/fun/coupons/${mockId}/redeem`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(mockCoupon.save).toHaveBeenCalled();
      expect(mockCoupon.status).toBe('redeemed');
    });

    it('deve retornar 400 se o vale já foi resgatado', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCoupon = {
        _id: mockId,
        title: 'Vale já usado',
        coupleId: mockCoupleId,
        status: 'redeemed',
        save: jest.fn(),
      };

      Coupon.findById = jest.fn().mockResolvedValue(mockCoupon);

      const res = await request(app)
        .patch(`/api/fun/coupons/${mockId}/redeem`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('Este vale já foi utilizado!');
    });

    it('deve retornar 404 se o vale não existir', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      Coupon.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/fun/coupons/${fakeId}/redeem`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(404);
    });

    it('deve retornar 403 se o vale pertencer a outro casal', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCoupon = {
        _id: mockId,
        title: 'Vale de outro casal',
        coupleId: 'outro_casal_id',
        status: 'gifted',
        save: jest.fn(),
      };

      Coupon.findById = jest.fn().mockResolvedValue(mockCoupon);

      const res = await request(app)
        .patch(`/api/fun/coupons/${mockId}/redeem`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(403);
    });
  });

  // -------------------------------------------------------
  // DELETE /api/fun/coupons/:id
  // -------------------------------------------------------
  describe('DELETE /api/fun/coupons/:id', () => {
    it('deve eliminar um vale com sucesso', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCoupon = {
        _id: mockId,
        title: 'Vale para eliminar',
        coupleId: mockCoupleId,
        createdBy: 'maria',
      };

      Coupon.findById = jest.fn().mockResolvedValue(mockCoupon);
      Coupon.findByIdAndDelete = jest.fn().mockResolvedValue(mockCoupon);

      const res = await request(app)
        .delete(`/api/fun/coupons/${mockId}`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(Coupon.findByIdAndDelete).toHaveBeenCalled();
    });

    it('deve retornar 404 ao tentar eliminar vale inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      Coupon.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/fun/coupons/${fakeId}`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(404);
    });

    it('deve retornar 403 ao tentar eliminar vale de outro casal', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCoupon = {
        _id: mockId,
        title: 'Vale de outro casal',
        coupleId: 'outro_casal_id',
        createdBy: 'mario',
      };

      Coupon.findById = jest.fn().mockResolvedValue(mockCoupon);

      const res = await request(app)
        .delete(`/api/fun/coupons/${mockId}`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(403);
    });
  });
});

// ================================================================
// RASPADINHAS
// ================================================================
describe('Raspadinhas (Scratch Cards) API Tests', () => {
  const mockToken = 'mock_token_jwt';
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockCoupleId = 'test_couple_456';

  const mockUser = {
    _id: mockUserId,
    username: 'maria',
    email: 'maria@example.com',
    role: 'user',
    coupleId: mockCoupleId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreta_teste_jwt';

    const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');
    TokenBlacklist.findOne.mockResolvedValue(null);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUserId, username: 'maria', role: 'user' });
    User.findById.mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/fun/scratch-cards', () => {
    it('deve devolver as raspadinhas do casal', async () => {
      const mockCards = [
        { _id: '1', title: 'Raspadinha Especial', isScratched: false, coupleId: mockCoupleId },
      ];

      ScratchCard.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCards),
      });

      const res = await request(app)
        .get('/api/fun/scratch-cards')
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].isScratched).toBe(false);
    });

    it('deve rejeitar pedido sem autenticação', async () => {
      const res = await request(app).get('/api/fun/scratch-cards');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/fun/scratch-cards', () => {
    it('deve criar uma raspadinha com sucesso', async () => {
      const newCard = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Surpresa especial',
        reward: 'Um jantar a dois',
        coupleId: mockCoupleId,
        createdBy: 'maria',
        isScratched: false,
      };

      ScratchCard.create = jest.fn().mockResolvedValue(newCard);

      const res = await request(app)
        .post('/api/fun/scratch-cards')
        .send({ title: 'Surpresa especial', reward: 'Um jantar a dois' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toBe('Surpresa especial');
    });

    it('deve falhar se o título ou a recompensa estiverem em falta', async () => {
      const res = await request(app)
        .post('/api/fun/scratch-cards')
        .send({ title: 'Só o título' }) // falta reward
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('PATCH /api/fun/scratch-cards/:id/scratch', () => {
    it('deve raspar uma raspadinha disponível com sucesso', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCard = {
        _id: mockId,
        title: 'Surpresa',
        reward: 'Jantar',
        coupleId: mockCoupleId,
        isScratched: false,
        save: jest.fn().mockResolvedValue({}),
      };

      ScratchCard.findById = jest.fn().mockResolvedValue(mockCard);

      const res = await request(app)
        .patch(`/api/fun/scratch-cards/${mockId}/scratch`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(mockCard.save).toHaveBeenCalled();
      expect(mockCard.isScratched).toBe(true);
    });

    it('deve retornar 400 se a raspadinha já tiver sido raspada', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCard = {
        _id: mockId,
        title: 'Raspadinha já usada',
        coupleId: mockCoupleId,
        isScratched: true, // já foi raspada!
        save: jest.fn(),
      };

      ScratchCard.findById = jest.fn().mockResolvedValue(mockCard);

      const res = await request(app)
        .patch(`/api/fun/scratch-cards/${mockId}/scratch`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('Esta raspadinha já foi raspada.');
    });

    it('deve retornar 404 se a raspadinha não existir', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      ScratchCard.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/fun/scratch-cards/${fakeId}/scratch`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(404);
    });

    it('deve retornar 403 se a raspadinha pertencer a outro casal', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCard = {
        _id: mockId,
        title: 'Raspadinha de outro casal',
        coupleId: 'outro_casal_id',
        isScratched: false,
        save: jest.fn(),
      };

      ScratchCard.findById = jest.fn().mockResolvedValue(mockCard);

      const res = await request(app)
        .patch(`/api/fun/scratch-cards/${mockId}/scratch`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/fun/scratch-cards/:id', () => {
    it('deve eliminar uma raspadinha criada pelo utilizador', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCard = {
        _id: mockId,
        title: 'Raspadinha para apagar',
        coupleId: mockCoupleId,
        createdBy: 'maria',
      };

      ScratchCard.findById = jest.fn().mockResolvedValue(mockCard);
      ScratchCard.findByIdAndDelete = jest.fn().mockResolvedValue(mockCard);

      const res = await request(app)
        .delete(`/api/fun/scratch-cards/${mockId}`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
    });

    it('deve retornar 403 se tentar eliminar raspadinha criada pelo parceiro', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockCard = {
        _id: mockId,
        title: 'Raspadinha do parceiro',
        coupleId: mockCoupleId,
        createdBy: 'mario', // diferente do utilizador autenticado 'maria'
      };

      ScratchCard.findById = jest.fn().mockResolvedValue(mockCard);

      const res = await request(app)
        .delete(`/api/fun/scratch-cards/${mockId}`)
        .set('Cookie', [`token=${mockToken}`]);

      // deleteScratchCard usa checkOwnership=true
      expect(res.statusCode).toEqual(403);
    });
  });
});
