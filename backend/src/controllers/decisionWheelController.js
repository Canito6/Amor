const DecisionWheel = require('../models/DecisionWheel');
const ApiError = require('../utils/apiError');

exports.getDecisionWheels = async (req, res, next) => {
  try {
    const wheels = await DecisionWheel.find({ coupleId: req.coupleId }).sort({ createdAt: -1 });
    res.json(wheels);
  } catch (error) {
    next(error);
  }
};

exports.createDecisionWheel = async (req, res, next) => {
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

    const wheel = new DecisionWheel({
      title: title.trim(),
      options: filteredOptions,
      createdBy: req.user.username,
      coupleId: req.coupleId
    });

    await wheel.save();
    res.status(201).json(wheel);
  } catch (error) {
    next(error);
  }
};

exports.deleteDecisionWheel = async (req, res, next) => {
  try {
    const wheel = await DecisionWheel.findById(req.params.id);
    if (!wheel) {
      throw new ApiError(404, 'Roleta não encontrada.');
    }

    if (wheel.coupleId !== req.coupleId && req.user.role !== 'admin') {
      throw new ApiError(403, 'Acesso não autorizado.');
    }

    // Apenas quem criou ou admin pode apagar
    if (wheel.createdBy !== req.user.username && req.user.role !== 'admin') {
      throw new ApiError(403, 'Apenas o autor pode apagar esta roleta.');
    }

    await DecisionWheel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Roleta apagada com sucesso!' });
  } catch (error) {
    next(error);
  }
};
