const BaseController = require('../baseController');
const eventBus = require('../../utils/eventBus');

class ScratchCardController extends BaseController {
  constructor(scratchCardService, scratchCardRepository) {
    super(scratchCardRepository, 'Raspadinha');
    this.scratchCardService = scratchCardService;
  }

  getScratchCards = async (req, res, next) => {
    await this.getAllItems(req, res, next);
  };

  createScratchCard = async (req, res, next) => {
    await this.createItem(req, res, next);
  };

  scratchCard = async (req, res, next) => {
    try {
      const card = await this.scratchCardService.scratchCard(req.params.id, req.coupleId);
      
      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: 'raspadinha-scratched',
          user: req.user.username,
          value: card.title
        });
      } catch (err) {
        // Ignorar erros
      }

      res.json(card);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteScratchCard = async (req, res, next) => {
    await this.deleteItem(req, res, next, true);
  };
}

module.exports = ScratchCardController;
