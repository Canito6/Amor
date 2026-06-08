const BaseController = require('../baseController');

class MessageController extends BaseController {
  constructor(messageService, messageRepository) {
    super(messageRepository, 'Mensagem');
    this.messageService = messageService;
  }

  getMessages = async (req, res, next) => {
    await this.getAllItems(req, res, next, {}, { createdAt: 1 });
  };

  createMessage = async (req, res, next) => {
    try {
      const { content } = req.body;
      const message = await this.messageService.createMessage(content, req.user.username, req.coupleId);
      res.status(201).json(message);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  editMessage = async (req, res, next) => {
    try {
      const { content } = req.body;
      const message = await this.messageService.editMessage(req.params.id, content, req.user.username, req.user.role, req.coupleId);
      res.json(message);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  reactToMessage = async (req, res, next) => {
    try {
      const { emoji } = req.body;
      const message = await this.messageService.reactToMessage(req.params.id, emoji, req.user.username, req.coupleId);
      res.json(message);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteMessage = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = MessageController;
