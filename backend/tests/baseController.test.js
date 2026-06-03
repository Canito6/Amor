const BaseController = require('../src/controllers/baseController');
const ApiError = require('../src/utils/apiError');

// Mock model class
class MockModel {
  static find = jest.fn();
  static findById = jest.fn();
  static findByIdAndDelete = jest.fn();
  
  constructor(data) {
    Object.assign(this, data);
  }
  
  save = jest.fn();
}

class ConcreteController extends BaseController {
  constructor() {
    super(MockModel, 'MockItem');
  }
}

describe('BaseController unit tests', () => {
  let controller;
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ConcreteController();
    req = {
      coupleId: 'couple123',
      user: { username: 'testuser', role: 'user' },
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('handleError', () => {
    it('deve retornar ApiError se já for ApiError', () => {
      const apiErr = new ApiError(400, 'Bad Request');
      expect(controller.handleError(apiErr)).toBe(apiErr);
    });

    it('deve transformar ValidationError em ApiError', () => {
      const validationError = {
        name: 'ValidationError',
        errors: {
          title: { message: 'Title is required' }
        }
      };
      const result = controller.handleError(validationError);
      expect(result).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(400);
      expect(result.message).toContain('Title is required');
    });

    it('deve transformar CastError em ApiError', () => {
      const castError = {
        name: 'CastError',
        value: 'invalid_id'
      };
      const result = controller.handleError(castError);
      expect(result).toBeInstanceOf(ApiError);
      expect(result.statusCode).toBe(400);
      expect(result.message).toContain('Identificador inválido');
    });
  });

  describe('getAllItems', () => {
    it('deve obter itens ordenados filtrados por coupleId', async () => {
      const mockItems = [{ title: 'Item 1' }, { title: 'Item 2' }];
      const sortMock = jest.fn().mockResolvedValue(mockItems);
      MockModel.find.mockReturnValue({ sort: sortMock });

      await controller.getAllItems(req, res, next);

      expect(MockModel.find).toHaveBeenCalledWith({ coupleId: 'couple123' });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it('deve obter itens paginados se page e limit forem fornecidos', async () => {
      req.query.page = '2';
      req.query.limit = '10';

      const mockItems = [{ title: 'Item 11' }];
      const limitMock = jest.fn().mockResolvedValue(mockItems);
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      MockModel.find.mockReturnValue({ sort: sortMock });
      MockModel.countDocuments = jest.fn().mockResolvedValue(25);

      await controller.getAllItems(req, res, next);

      expect(MockModel.find).toHaveBeenCalledWith({ coupleId: 'couple123' });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skipMock).toHaveBeenCalledWith(10);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(MockModel.countDocuments).toHaveBeenCalledWith({ coupleId: 'couple123' });
      expect(res.json).toHaveBeenCalledWith({
        data: mockItems,
        total: 25,
        pages: 3,
        currentPage: 2
      });
    });
  });

  describe('deleteItem', () => {
    it('deve falhar se o item não for encontrado', async () => {
      MockModel.findById.mockResolvedValue(null);
      req.params.id = 'nonexistent';

      await controller.deleteItem(req, res, next);

      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(404);
    });

    it('deve falhar se o item pertencer a outro casal', async () => {
      MockModel.findById.mockResolvedValue({
        coupleId: 'outro_casal',
        createdBy: 'outro_user'
      });
      req.params.id = 'item123';

      await controller.deleteItem(req, res, next);

      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(403);
    });

    it('deve apagar se pertencer ao mesmo casal', async () => {
      MockModel.findById.mockResolvedValue({
        coupleId: 'couple123',
        createdBy: 'testuser'
      });
      req.params.id = 'item123';

      await controller.deleteItem(req, res, next);

      expect(MockModel.findByIdAndDelete).toHaveBeenCalledWith('item123');
      expect(res.json).toHaveBeenCalledWith({ message: 'MockItem apagado(a) com sucesso!' });
    });
  });
});
