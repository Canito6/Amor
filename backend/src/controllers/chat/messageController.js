const BaseController = require('../baseController');
const eventBus = require('../../utils/eventBus');

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
      
      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: 'mensagem-created',
          user: req.user.username,
          value: message.content
        });
      } catch (err) {
        // Ignorar erros
      }

      res.status(201).json(message);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  editMessage = async (req, res, next) => {
    try {
      const { content } = req.body;
      const message = await this.messageService.editMessage(req.params.id, content, req.user.username, req.user.role, req.coupleId);
      
      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: 'mensagem-edited',
          user: req.user.username,
          value: message.content
        });
      } catch (err) {
        // Ignorar erros
      }

      res.json(message);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  reactToMessage = async (req, res, next) => {
    try {
      const { emoji } = req.body;
      const message = await this.messageService.reactToMessage(req.params.id, emoji, req.user.username, req.coupleId);
      
      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: 'mensagem-reacted',
          user: req.user.username,
          value: emoji
        });
      } catch (err) {
        // Ignorar erros
      }

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
