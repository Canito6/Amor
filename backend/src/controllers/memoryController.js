const Memory = require('../models/Memory');
const BaseController = require('./baseController');
const memoryService = require('../services/memoryService');

class MemoryController extends BaseController {
  constructor() {
    super(Memory, 'Momento');
  }

  getMemories = async (req, res, next) => {
    try {
      const memories = await memoryService.getMemories(req.coupleId);
      res.json(memories);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  createMemory = async (req, res, next) => {
    try {
      const memory = await memoryService.createMemory(req.body, req.user.username, req.coupleId);
      res.status(201).json(memory);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  editMemory = async (req, res, next) => {
    try {
      const memory = await memoryService.editMemory(req.params.id, req.body, req.user.username, req.user.role, req.coupleId);
      res.json(memory);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteMemory = async (req, res, next) => {
    await this.deleteItem(req, res, next, true);
  };
}

module.exports = new MemoryController();
