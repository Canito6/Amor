const validate = require('../src/middlewares/validate');
const ApiError = require('../src/utils/apiError');
const { z } = require('zod');

describe('Zod Validation Middleware unit tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    };
    res = {};
    next = jest.fn();
  });

  const testSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    age: z.number().int().positive()
  });

  it('deve passar a validação com dados corretos no body', async () => {
    req.body = { username: 'john_doe', age: 25 };
    const middleware = validate({ body: testSchema });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ username: 'john_doe', age: 25 });
  });

  it('deve falhar a validação se faltarem campos obrigatórios no body', async () => {
    req.body = { username: 'jo' }; // too short, age is missing
    const middleware = validate({ body: testSchema });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('username: Username must be at least 3 characters');
    expect(err.message).toContain('age: Invalid input');
  });

  it('deve validar query parameters se configurado', async () => {
    const querySchema = z.object({
      search: z.string().min(1)
    });
    req.query = { search: '' };
    const middleware = validate({ query: querySchema });

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(400);
  });
});
