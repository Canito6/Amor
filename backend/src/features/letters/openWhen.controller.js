const BaseController = require('../baseController');

class OpenWhenController extends BaseController {
  constructor(openWhenService, openWhenRepository) {
    super(openWhenRepository, 'Carta');
    this.openWhenService = openWhenService;
  }

  getLetters = async (req, res, next) => {
    try {
      const letters = await this.openWhenService.getLetters(req.coupleId, req.user.username);
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
      const letter = await this.openWhenService.openLetter(req.params.id, req.user.username, req.user.id, req.coupleId);
      res.json(letter);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteLetter = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = OpenWhenController;
