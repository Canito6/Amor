const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock da ligação ao MongoDB
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

const app = require('../src/server');

// Mock dos modelos necessários
const User = require('../src/models/auth/userModel');
const BucketItem = require('../src/models/fun/bucketItemModel');
const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');

jest.mock('../src/models/auth/userModel');
jest.mock('../src/models/fun/bucketItemModel');
jest.mock('../src/models/auth/tokenBlacklistModel');

// Mock do Cloudinary (storageService) para evitar chamadas reais
jest.mock('../src/services/common/storageService', () => ({
  uploadFile: jest.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/test-image.jpg' }),
  deleteFile: jest.fn().mockResolvedValue({}),
}));

describe('Bucket List API Endpoints Tests', () => {
  const mockToken = 'mock_token_jwt';
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockCoupleId = 'test_couple_123';

  const mockUser = {
    _id: mockUserId,
    username: 'mario',
    email: 'mario@example.com',
    role: 'user',
    coupleId: mockCoupleId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreta_teste_jwt';

    // Setup do middleware de autenticação
    TokenBlacklist.findOne.mockResolvedValue(null);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUserId, username: 'mario', role: 'user' });
    User.findById.mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // -------------------------------------------------------
  // GET /api/fun/bucket-items
  // -------------------------------------------------------
  describe('GET /api/fun/bucket-items', () => {
    it('deve devolver lista vazia quando não há desejos', async () => {
      BucketItem.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const res = await request(app)
        .get('/api/fun/bucket-items')
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('deve devolver os desejos do casal ordenados', async () => {
      const mockItems = [
        { _id: '1', title: 'Ver o nascer do sol', completed: false, coupleId: mockCoupleId },
        { _id: '2', title: 'Viajar para Paris', completed: true, coupleId: mockCoupleId },
      ];

      BucketItem.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockItems),
      });

      const res = await request(app)
        .get('/api/fun/bucket-items')
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Ver o nascer do sol');
    });

    it('deve falhar sem autenticação (sem token)', async () => {
      const res = await request(app).get('/api/fun/bucket-items');

      expect(res.statusCode).toEqual(401);
    });
  });

  // -------------------------------------------------------
  // POST /api/fun/bucket-items
  // -------------------------------------------------------
  describe('POST /api/fun/bucket-items', () => {
    it('deve criar um novo desejo com sucesso', async () => {
      const newItem = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: 'Ver o nascer do sol',
        description: 'Na praia',
        completed: false,
        coupleId: mockCoupleId,
        createdBy: 'mario',
      };

      const saveMock = jest.fn().mockResolvedValue(newItem);
      BucketItem.mockImplementation(() => ({
        ...newItem,
        save: saveMock,
      }));

      const res = await request(app)
        .post('/api/fun/bucket-items')
        .send({ title: 'Ver o nascer do sol', description: 'Na praia' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(201);
      expect(saveMock).toHaveBeenCalled();
    });

    it('deve falhar se o título estiver vazio', async () => {
      const res = await request(app)
        .post('/api/fun/bucket-items')
        .send({ title: '', description: 'Sem título' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('O título do desejo é obrigatório.');
    });

    it('deve falhar se o título não for enviado', async () => {
      const res = await request(app)
        .post('/api/fun/bucket-items')
        .send({ description: 'Sem título' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('O título do desejo é obrigatório.');
    });
  });

  // -------------------------------------------------------
  // PATCH /api/fun/bucket-items/:id/complete
  // -------------------------------------------------------
  describe('PATCH /api/fun/bucket-items/:id/complete', () => {
    it('deve marcar um desejo como concluído', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockItem = {
        _id: mockId,
        title: 'Viajar para Paris',
        completed: false,
        coupleId: mockCoupleId,
        imageUrl: '',
        save: jest.fn().mockResolvedValue({}),
      };

      BucketItem.findById = jest.fn().mockResolvedValue(mockItem);

      const res = await request(app)
        .patch(`/api/fun/bucket-items/${mockId}/complete`)
        .send({ completed: true })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(mockItem.save).toHaveBeenCalled();
      expect(mockItem.completed).toBe(true);
      expect(mockItem.completedBy).toBe('mario');
    });

    it('deve desmarcar um desejo concluído (toggle off)', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockItem = {
        _id: mockId,
        title: 'Viajar para Paris',
        completed: true,
        completedBy: 'mario',
        coupleId: mockCoupleId,
        imageUrl: '',
        save: jest.fn().mockResolvedValue({}),
      };

      BucketItem.findById = jest.fn().mockResolvedValue(mockItem);

      const res = await request(app)
        .patch(`/api/fun/bucket-items/${mockId}/complete`)
        .send({ completed: false })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(mockItem.completed).toBe(false);
      expect(mockItem.completedBy).toBe('');
    });

    it('deve devolver 404 se o desejo não existir', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      BucketItem.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/fun/bucket-items/${fakeId}/complete`)
        .send({ completed: true })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(404);
    });

    it('deve devolver 403 se o desejo pertencer a outro casal', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockItem = {
        _id: mockId,
        title: 'Desejo de outro casal',
        completed: false,
        coupleId: 'outro_casal_id',
        imageUrl: '',
        save: jest.fn(),
      };

      BucketItem.findById = jest.fn().mockResolvedValue(mockItem);

      const res = await request(app)
        .patch(`/api/fun/bucket-items/${mockId}/complete`)
        .send({ completed: true })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(403);
    });
  });

  // -------------------------------------------------------
  // DELETE /api/fun/bucket-items/:id
  // -------------------------------------------------------
  describe('DELETE /api/fun/bucket-items/:id', () => {
    it('deve eliminar um desejo com sucesso', async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockItem = {
        _id: mockId,
        title: 'Desejo para apagar',
        coupleId: mockCoupleId,
        imageUrl: '',
      };

      BucketItem.findById = jest.fn().mockResolvedValue(mockItem);
      BucketItem.findByIdAndDelete = jest.fn().mockResolvedValue(mockItem);

      const res = await request(app)
        .delete(`/api/fun/bucket-items/${mockId}`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(BucketItem.findByIdAndDelete).toHaveBeenCalledWith(mockId);
    });

    it('deve devolver 404 ao tentar apagar um desejo inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      BucketItem.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/fun/bucket-items/${fakeId}`)
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(404);
    });
  });
});
