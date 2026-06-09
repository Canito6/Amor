const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock da ligação ao MongoDB para evitar chamadas de rede durante os testes
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Importar a aplicação express
const app = require('../src/server');

// Mock dos modelos Mongoose
const User = require('../src/models/auth/userModel');
const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');

jest.mock('../src/models/auth/userModel');
jest.mock('../src/models/auth/tokenBlacklistModel');

describe('Quiz AI Generation API Endpoint Tests', () => {
  const mockToken = 'mock_token_jwt';
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockUser = {
    _id: mockUserId,
    username: 'mario',
    email: 'mario@example.com',
    role: 'user',
    coupleId: 'mock_couple_id'
  };

  let originalApiKey;

  beforeAll(() => {
    originalApiKey = process.env.GEMINI_API_KEY;
  });

  afterAll(async () => {
    process.env.GEMINI_API_KEY = originalApiKey;
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreta_teste_jwt';
    delete process.env.GEMINI_API_KEY;
    
    // Mock do middleware de autenticação
    TokenBlacklist.findOne.mockResolvedValue(null);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUserId, username: 'mario', role: 'user' });
    User.findById.mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/quizzes/generate-ai', () => {
    it('deve gerar um quiz modelo (fallback) quando a API key não está definida', async () => {
      const res = await request(app)
        .post('/api/quizzes/generate-ai')
        .send({ theme: 'romantico', language: 'pt' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('questions');
      expect(res.body.aiUsed).toBe(false);
      expect(res.body.questions.length).toBe(5);
      expect(res.body.questions[0]).toHaveProperty('questionText');
      expect(res.body.questions[0]).toHaveProperty('options');
      expect(res.body.questions[0]).toHaveProperty('creatorAnswer');
    });

    it('deve aceitar tema vazio e usar o fallback geral', async () => {
      const res = await request(app)
        .post('/api/quizzes/generate-ai')
        .send({ theme: '', language: 'en' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.aiUsed).toBe(false);
      expect(res.body.title).toContain('General Affinity');
      expect(res.body.questions.length).toBe(5);
    });
  });
});
