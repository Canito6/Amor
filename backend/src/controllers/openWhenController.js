const OpenWhenLetter = require('../models/OpenWhenLetter');
const BaseController = require('./baseController');
const openWhenService = require('../services/openWhenService');

class OpenWhenController extends BaseController {
  constructor() {
    super(OpenWhenLetter, 'Carta');
  }

  getLetters = async (req, res, next) => {
    try {
      const letters = await openWhenService.getLetters(req.coupleId, req.user.username);
      res.json(letters);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  createLetter = async (req, res, next) => {
    await this.createItem(req, res, next);
  };

  openLetter = async (req, res, next) => {
    try {
      const letter = await openWhenService.openLetter(req.params.id, req.user.username, req.user.id, req.coupleId);
      res.json(letter);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteLetter = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = new OpenWhenController();
