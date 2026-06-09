const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mock da ligação ao MongoDB para evitar chamadas de rede durante os testes
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Importar a aplicação express
const app = require('../src/server');

// Mock dos modelos Mongoose
const User = require('../src/models/auth/userModel');
const DailyCheckIn = require('../src/models/couple/dailyCheckInModel');
const TokenBlacklist = require('../src/models/auth/tokenBlacklistModel');

jest.mock('../src/models/auth/userModel');
jest.mock('../src/models/couple/dailyCheckInModel');
jest.mock('../src/models/auth/tokenBlacklistModel');

describe('Daily Check-In API Endpoints Tests', () => {
  const mockToken = 'mock_token_jwt';
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockUser = {
    _id: mockUserId,
    username: 'mario',
    email: 'mario@example.com',
    role: 'user',
    coupleId: 'mock_couple_id'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'secreta_teste_jwt';
    
    // Mock do middleware de autenticação
    TokenBlacklist.findOne.mockResolvedValue(null);
    jest.spyOn(jwt, 'verify').mockReturnValue({ id: mockUserId, username: 'mario', role: 'user' });
    User.findById.mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/daily-checkin', () => {
    it('deve obter ou criar o check-in do dia com a pergunta determinística', async () => {
      // Simular que o check-in do dia ainda não existe na base de dados
      DailyCheckIn.findOne.mockResolvedValue(null);

      // Mock da função save do modelo
      const saveMock = jest.fn().mockImplementation(function() {
        return this;
      });
      DailyCheckIn.mockImplementation(function(data) {
        return {
          ...data,
          _id: 'mock_checkin_id',
          save: saveMock
        };
      });

      const res = await request(app)
        .get('/api/daily-checkin')
        .query({ date: '2026-06-03' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('question');
      expect(res.body).toHaveProperty('revealed', false);
      expect(res.body.answers).toEqual([]);
    });

    it('deve filtrar a resposta do parceiro se apenas um tiver respondido', async () => {
      const mockCheckInExistente = {
        _id: 'mock_checkin_id',
        coupleId: 'mock_couple_id',
        date: '2026-06-03',
        question: 'Qual foi o nosso primeiro encontro?',
        answers: [
          {
            userId: new mongoose.Types.ObjectId().toString(), // Outro utilizador
            username: 'maria',
            answerText: 'No cinema a ver um filme de terror',
            createdAt: new Date()
          }
        ]
      };

      DailyCheckIn.findOne.mockResolvedValue(mockCheckInExistente);

      const res = await request(app)
        .get('/api/daily-checkin')
        .query({ date: '2026-06-03' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.revealed).toBe(false);
      expect(res.body.answers.length).toBe(1);
      // A resposta da Maria deve vir a null (ocultada para o Mario)
      expect(res.body.answers[0].answerText).toBeNull();
      expect(res.body.answers[0].username).toBe('maria');
    });

    it('deve revelar todas as respostas se ambos tiverem respondido', async () => {
      const mockCheckInExistente = {
        _id: 'mock_checkin_id',
        coupleId: 'mock_couple_id',
        date: '2026-06-03',
        question: 'Qual foi o nosso primeiro encontro?',
        answers: [
          {
            userId: mockUserId, // Mario
            username: 'mario',
            answerText: 'No cinema!',
            createdAt: new Date()
          },
          {
            userId: new mongoose.Types.ObjectId().toString(), // Maria
            username: 'maria',
            answerText: 'No cinema a ver terror!',
            createdAt: new Date()
          }
        ]
      };

      DailyCheckIn.findOne.mockResolvedValue(mockCheckInExistente);

      const res = await request(app)
        .get('/api/daily-checkin')
        .query({ date: '2026-06-03' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.revealed).toBe(true);
      expect(res.body.answers.length).toBe(2);
      expect(res.body.answers[0].answerText).toBe('No cinema!');
      expect(res.body.answers[1].answerText).toBe('No cinema a ver terror!');
    });
  });

  describe('POST /api/daily-checkin/answer', () => {
    it('deve falhar se a resposta estiver vazia', async () => {
      const res = await request(app)
        .post('/api/daily-checkin/answer')
        .send({ answerText: '', date: '2026-06-03' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('O texto da resposta é obrigatório.');
    });

    it('deve submeter uma resposta com sucesso', async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      const mockCheckIn = {
        _id: 'mock_checkin_id',
        coupleId: 'mock_couple_id',
        date: '2026-06-03',
        question: 'Qual foi o nosso primeiro encontro?',
        answers: [],
        save: saveMock
      };

      DailyCheckIn.findOne.mockResolvedValue(mockCheckIn);

      const res = await request(app)
        .post('/api/daily-checkin/answer')
        .send({ answerText: 'Cinema', date: '2026-06-03' })
        .set('Cookie', [`token=${mockToken}`]);

      expect(res.statusCode).toEqual(200);
      expect(saveMock).toHaveBeenCalled();
      expect(res.body.answers.length).toBe(1);
      expect(res.body.answers[0].answerText).toBe('Cinema');
      expect(res.body.answers[0].username).toBe('mario');
    });
  });
});
