const Event = require('../models/Event');
const BaseController = require('./baseController');
const ApiError = require('../utils/apiError');

class EventController extends BaseController {
  constructor() {
    super(Event, 'Evento');
  }

  getEvents = async (req, res, next) => {
    // Sort by date: 1 (chronological ascending)
    await this.getAllItems(req, res, next, {}, { date: 1 });
  };

  createEvent = async (req, res, next) => {
    try {
      const { title, description, date, category } = req.body;

      if (!title || !title.trim()) {
        throw new ApiError(400, 'O título do evento é obrigatório.');
      }
      if (!date) {
        throw new ApiError(400, 'A data do evento é obrigatória.');
      }

      await this.createItem(req, res, next, {
        title,
        description,
        date: new Date(date),
        category: category || 'outro'
      });
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteEvent = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = new EventController();
