const request = require('supertest');
const mongoose = require('mongoose');

// Mock da ligação ao MongoDB para evitar chamadas de rede durante os testes
jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

// Mock dos modelos Mongoose para o app.js não falhar ao carregar
jest.mock('../src/models/auth/userModel');
jest.mock('../src/models/couple/coupleModel');

const app = require('../src/server');
const errorHandler = require('../src/middlewares/errorHandler');
const winston = require('winston');

// Silenciar logs do Winston durante os testes para manter a consola limpa
const logger = require('../src/utils/logger');
logger.transports.forEach((t) => {
  t.silent = true;
});

describe('Testes de Segurança - Middlewares', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Headers de Segurança (Helmet)', () => {
    it('deve incluir os headers de segurança do Helmet', async () => {
      const res = await request(app).get('/api/non-existent-route-for-testing-helmet');
      
      // Verificar se headers comuns do Helmet estão presentes
      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('x-dns-prefetch-control', 'off');
      expect(res.headers).toHaveProperty('content-security-policy');
    });
  });

  describe('Global Error Handler Middleware (Unit Tests)', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
      mockReq = {
        method: 'POST',
        originalUrl: '/api/test',
        url: '/api/test'
      };
      mockRes = {
        statusCode: 200,
        status: jest.fn().mockImplementation(function (code) {
          this.statusCode = code;
          return this;
        }),
        json: jest.fn()
      };
      nextFunction = jest.fn();
    });

    it('deve traduzir ValidationError do Mongoose para ApiError 400', () => {
      const valError = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email inválido.' }
        }
      };

      errorHandler(valError, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Erro de validação de dados: Email inválido.')
        })
      );
    });

    it('deve traduzir CastError do Mongoose para ApiError 400', () => {
      const castError = {
        name: 'CastError',
        value: '123_invalid_id'
      };

      errorHandler(castError, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Recurso não encontrado com o ID formatado incorretamente')
        })
      );
    });

    it('deve traduzir erro de chave duplicada MongoDB (11000) para ApiError 400', () => {
      const duplicateError = {
        code: 11000,
        keyValue: { email: 'test@example.com' }
      };

      errorHandler(duplicateError, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("O campo 'email' já está em uso.")
        })
      );
    });

    it('deve traduzir JsonWebTokenError para ApiError 401', () => {
      const jwtError = {
        name: 'JsonWebTokenError'
      };

      errorHandler(jwtError, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Token de autenticação inválido')
        })
      );
    });

    it('deve traduzir TokenExpiredError para ApiError 401', () => {
      const expiredError = {
        name: 'TokenExpiredError'
      };

      errorHandler(expiredError, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('A sua sessão expirou')
        })
      );
    });

    it('não deve vazar stack traces em ambiente de produção para erros internos', () => {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const internalError = new Error('Database connection crashed!');

      errorHandler(internalError, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Ocorreu um erro interno no servidor.'
      });

      // Restaurar env
      process.env.NODE_ENV = oldEnv;
    });

    it('deve incluir stack traces em ambiente de desenvolvimento para depuração', () => {
      const oldEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const internalError = new Error('Database connection crashed!');

      errorHandler(internalError, mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Ocorreu um erro interno no servidor.',
          stack: expect.any(String)
        })
      );

      process.env.NODE_ENV = oldEnv;
    });
  });

  describe('Rate Limiting (Integração)', () => {
    it('deve limitar requisições excessivas em /api/auth com base na quota de 10 requisições', async () => {
      // Fazemos 10 requisições aceitáveis
      for (let i = 0; i < 10; i++) {
        await request(app).post('/api/auth/login').send({ username: 'u', password: 'p' });
      }
      
      // A 11ª requisição deve falhar com status 429
      const res = await request(app).post('/api/auth/login').send({ username: 'u', password: 'p' });
      
      expect(res.statusCode).toEqual(429);
      expect(res.body.error).toContain('Limite de tentativas de autenticação excedido');
    });

    it('deve permitir mais de 10 requisições em rotas de dados sob /api/auth sem disparar o rate limiter de autenticação', async () => {
      // Fazemos 12 requisições em /api/auth/couple-info (que é uma rota de dados)
      for (let i = 0; i < 12; i++) {
        await request(app).get('/api/auth/couple-info');
      }
      
      // O status code deve ser 401 (Unauthorized) ou outro erro normal, mas NÃO 429 (Too Many Requests)
      const res = await request(app).get('/api/auth/couple-info');
      expect(res.statusCode).not.toEqual(429);
    });

    it('deve limitar requisições excessivas em rotas gerais com base na quota de 150 requisições', async () => {
      // Fazemos 150 requisições aceitáveis em rotas gerais (não auth)
      for (let i = 0; i < 150; i++) {
        await request(app).get('/api/general-test-route');
      }
      
      // A 151ª requisição deve falhar com status 429
      const res = await request(app).get('/api/general-test-route');
      
      expect(res.statusCode).toEqual(429);
      expect(res.body.error).toContain('Limite de pedidos excedido');
    });
  });
});
