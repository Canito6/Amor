const BaseController = require('../baseController');
const eventBus = require('../../utils/eventBus');

class MemoryController extends BaseController {
  constructor(memoryService, memoryRepository) {
    super(memoryRepository, 'Momento');
    this.memoryService = memoryService;
  }

  getMemories = async (req, res, next) => {
    try {
      const memories = await this.memoryService.getMemories(req.coupleId);
      res.json(memories);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  createMemory = async (req, res, next) => {
    try {
      const memory = await this.memoryService.createMemory(req.body, req.user.username, req.coupleId);
      
      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: 'momento-created',
          user: req.user.username,
          value: memory.title
        });
      } catch (err) {
        // Ignorar erros
      }

      res.status(201).json(memory);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  editMemory = async (req, res, next) => {
    try {
      const memory = await this.memoryService.editMemory(req.params.id, req.body, req.user.username, req.user.role, req.coupleId);
      
      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: 'momento-edited',
          user: req.user.username,
          value: memory.title
        });
      } catch (err) {
        // Ignorar erros
      }

      res.json(memory);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteMemory = async (req, res, next) => {
    await this.deleteItem(req, res, next, true);
  };
}

module.exports = MemoryController;
