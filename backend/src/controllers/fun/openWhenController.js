const BaseController = require('../baseController');
const eventBus = require('../../utils/eventBus');

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
      
      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: 'carta-opened',
          user: req.user.username,
          value: letter.title
        });
      } catch (err) {
        // Ignorar erros
      }

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
