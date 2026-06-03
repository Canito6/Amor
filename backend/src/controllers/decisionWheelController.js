const DecisionWheel = require('../models/DecisionWheel');
const BaseController = require('./baseController');
const ApiError = require('../utils/apiError');

class DecisionWheelController extends BaseController {
  constructor() {
    super(DecisionWheel, 'Roleta');
  }

  getDecisionWheels = async (req, res, next) => {
    await this.getAllItems(req, res, next);
  };

  createDecisionWheel = async (req, res, next) => {
    try {
      const { title, options } = req.body;
      
      if (!title || title.trim() === '') {
        throw new ApiError(400, 'O título da roleta é obrigatório.');
      }
      
      if (!options || !Array.isArray(options) || options.length < 2) {
        throw new ApiError(400, 'A roleta deve conter pelo menos 2 opções.');
      }

      const filteredOptions = options
        .map(opt => opt.trim())
        .filter(opt => opt !== '');

      if (filteredOptions.length < 2) {
        throw new ApiError(400, 'A roleta deve conter pelo menos 2 opções válidas.');
      }

      await this.createItem(req, res, next, {
        title,
        options: filteredOptions
      });
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteDecisionWheel = async (req, res, next) => {
    await this.deleteItem(req, res, next, true);
  };
}

module.exports = new DecisionWheelController();
