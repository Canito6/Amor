const ScratchCard = require('../models/ScratchCard');
const BaseController = require('./baseController');
const scratchCardService = require('../services/scratchCardService');

class ScratchCardController extends BaseController {
  constructor() {
    super(ScratchCard, 'Raspadinha');
  }

  getScratchCards = async (req, res, next) => {
    await this.getAllItems(req, res, next);
  };

  createScratchCard = async (req, res, next) => {
    await this.createItem(req, res, next);
  };

  scratchCard = async (req, res, next) => {
    try {
      const card = await scratchCardService.scratchCard(req.params.id, req.coupleId);
      res.json(card);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteScratchCard = async (req, res, next) => {
    await this.deleteItem(req, res, next, true);
  };
}

module.exports = new ScratchCardController();
