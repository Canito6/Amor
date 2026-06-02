const ScratchCard = require('../models/ScratchCard');
const ApiError = require('../utils/apiError');

exports.getScratchCards = async (req, res, next) => {
  try {
    const cards = await ScratchCard.find({ coupleId: req.coupleId }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    next(error);
  }
};

exports.createScratchCard = async (req, res, next) => {
  try {
    const { title, reward } = req.body;
    if (!title || title.trim() === '') {
      throw new ApiError(400, 'O título da raspadinha é obrigatório.');
    }
    if (!reward || reward.trim() === '') {
      throw new ApiError(400, 'O prémio da raspadinha é obrigatório.');
    }

    const card = new ScratchCard({
      title: title.trim(),
      reward: reward.trim(),
      createdBy: req.user.username,
      coupleId: req.coupleId
    });

    await card.save();
    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
};

exports.scratchCard = async (req, res, next) => {
  try {
    const card = await ScratchCard.findById(req.params.id);
    if (!card) {
      throw new ApiError(404, 'Raspadinha não encontrada.');
    }

    if (card.coupleId !== req.coupleId) {
      throw new ApiError(403, 'Acesso não autorizado.');
    }

    if (card.isScratched) {
      throw new ApiError(400, 'Esta raspadinha já foi raspada.');
    }

    // Apenas o parceiro que NÃO criou a raspadinha deve raspá-la (ou permitimos qualquer um, mas o parceiro faz mais sentido)
    // Para flexibilidade de testes e uso geral, permitimos qualquer membro do casal raspar, mas podemos registar quem raspou se quisermos.
    // Vamos apenas marcar como raspada.
    card.isScratched = true;
    card.scratchedAt = new Date();
    await card.save();

    res.json(card);
  } catch (error) {
    next(error);
  }
};

exports.deleteScratchCard = async (req, res, next) => {
  try {
    const card = await ScratchCard.findById(req.params.id);
    if (!card) {
      throw new ApiError(404, 'Raspadinha não encontrada.');
    }

    if (card.coupleId !== req.coupleId && req.user.role !== 'admin') {
      throw new ApiError(403, 'Acesso não autorizado.');
    }

    // Apenas quem criou ou admin pode apagar
    if (card.createdBy !== req.user.username && req.user.role !== 'admin') {
      throw new ApiError(403, 'Apenas o autor pode apagar esta raspadinha.');
    }

    await ScratchCard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Raspadinha apagada com sucesso!' });
  } catch (error) {
    next(error);
  }
};
