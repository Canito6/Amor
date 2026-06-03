const request = require('supertest');
const mongoose = require('mongoose');

// Mock da ligação ao MongoDB para evitar chamadas de rede durante os testes
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Importar a aplicação express
const app = require('../src/server');

// Mock dos modelos Mongoose
const User = require('../src/models/User');
const Couple = require('../src/models/Couple');

jest.mock('../src/models/User');
jest.mock('../src/models/Couple');

describe('Testes de Autenticação - API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('deve registar um novo utilizador com sucesso', async () => {
      // Mock do User.findOne para simular que o email/user não existe
      User.findOne.mockResolvedValue(null);

      // Mock dos métodos de save
      const saveMock = jest.fn().mockResolvedValue({});
      User.mockImplementation(() => ({
        save: saveMock,
        _id: 'mock_user_id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      }));

      const saveCoupleMock = jest.fn().mockResolvedValue({});
      Couple.mockImplementation(() => ({
        save: saveCoupleMock,
        _id: 'mock_couple_id'
      }));

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Conta criada com sucesso!');
    });

    it('deve falhar se o nome de utilizador ou email já estiverem em uso', async () => {
      // Simula que utilizador já existe
      User.findOne.mockResolvedValue({ username: 'testuser' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('Este utilizador ou email já existe!');
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com sucesso se as credenciais forem válidas e 2FA for direct', async () => {
      const mockComparePassword = jest.fn().mockResolvedValue(true);
      const mockUser = {
        _id: 'mock_user_id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        loginSecurityMethod: 'direct',
        comparePassword: mockComparePassword,
        precisaMudarPassword: false
      };

      User.findOne.mockResolvedValue(mockUser);
      process.env.JWT_SECRET = 'secreta_teste_jwt';

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Login feito com sucesso!');
      expect(res.body).toHaveProperty('token');
    });

    it('deve falhar com password incorreta', async () => {
      const mockComparePassword = jest.fn().mockResolvedValue(false);
      const mockSave = jest.fn().mockResolvedValue({});
      const mockUser = {
        _id: 'mock_user_id',
        username: 'testuser',
        comparePassword: mockComparePassword,
        precisaMudarPassword: false,
        loginAttempts: 0,
        save: mockSave
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toContain('Password incorreta!');
    });
  });
});
