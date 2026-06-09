const ApiError = require('../utils/apiError');
const eventBus = require('../utils/eventBus');

/**
 * Base abstract-style controller class implementing standard CRUD operations
 * using a Repository instance.
 */
class BaseController {
  constructor(repository, modelName) {
    if (new.target === BaseController) {
      throw new TypeError("Cannot construct BaseController instances directly");
    }
    this.repository = repository;
    this.modelName = modelName;
  }

  /**
   * Helper to standardize mongoose errors into ApiErrors
   */
  handleError(error) {
    if (error instanceof ApiError) {
      return error;
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(el => el.message).join(', ');
      return new ApiError(400, message);
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return new ApiError(409, `Registo duplicado para o campo: ${field}`);
    }
    if (error.name === 'CastError') {
      return new ApiError(400, `Identificador inválido: ${error.value}`);
    }
    return error;
  }

  /**
   * Fetch all items belonging to the couple.
   * Automatically paginates if req.query.page and req.query.limit are provided.
   */
  async getAllItems(req, res, next, query = {}, sort = { createdAt: -1 }) {
    try {
      const filter = { coupleId: req.coupleId, ...query };
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      if (page && limit) {
        const paginatedResult = await this.repository.findPaginated(filter, sort, page, limit);
        res.json({
          data: paginatedResult.data,
          total: paginatedResult.total,
          pages: paginatedResult.pages,
          currentPage: paginatedResult.currentPage
        });
      } else {
        const items = await this.repository.find(filter, sort);
        res.json(items);
      }
    } catch (error) {
      next(this.handleError(error));
    }
  }

  /**
   * Fetch a single item by ID with ownership checks
   */
  async getItemById(req, res, next) {
    try {
      const item = await this.repository.findById(req.params.id);
      if (!item) {
        throw new ApiError(404, `${this.modelName} não encontrado(a).`);
      }
      if (item.coupleId !== req.coupleId && req.user.role !== 'admin') {
        throw new ApiError(403, 'Acesso não autorizado.');
      }
      res.json(item);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  /**
   * Create a new item scoped to the couple
   */
  async createItem(req, res, next, bodyData) {
    try {
      const data = bodyData || req.body;
      const cleanData = { ...data, coupleId: req.coupleId };
      
      if (req.user && req.user.username) {
        cleanData.createdBy = req.user.username;
      }

      // Trim string inputs
      for (const key in cleanData) {
        if (typeof cleanData[key] === 'string') {
          cleanData[key] = cleanData[key].trim();
        }
      }

      const item = await this.repository.create(cleanData);

      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: `${this.modelName.toLowerCase()}-created`,
          user: req.user ? req.user.username : 'system',
          value: item.title || item.question || item.content || ''
        });
      } catch (err) {
        // Ignorar erros
      }

      res.status(201).json(item);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  /**
   * Delete an item by ID with ownership check option
   */
  async deleteItem(req, res, next, checkOwnership = false) {
    try {
      const item = await this.repository.findById(req.params.id);
      if (!item) {
        throw new ApiError(404, `${this.modelName} não encontrado(a).`);
      }

      if (item.coupleId !== req.coupleId && req.user.role !== 'admin') {
        throw new ApiError(403, 'Acesso não autorizado.');
      }

      if (checkOwnership && item.createdBy !== req.user.username && req.user.role !== 'admin') {
        throw new ApiError(403, `Apenas o autor pode apagar este/a ${this.modelName.toLowerCase()}.`);
      }

      await this.repository.findByIdAndDelete(req.params.id);

      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: `${this.modelName.toLowerCase()}-deleted`,
          user: req.user ? req.user.username : 'system',
          value: req.params.id
        });
      } catch (err) {
        // Ignorar erros
      }

      res.json({ message: `${this.modelName} apagado(a) com sucesso!` });
    } catch (error) {
      next(this.handleError(error));
    }
  }
}

module.exports = BaseController;
