const ScratchCard = require('../models/ScratchCard');
const ApiError = require('../utils/apiError');

class ScratchCardService {
  async scratchCard(id, coupleId) {
    const card = await ScratchCard.findById(id);
    if (!card) {
      throw new ApiError(404, 'Raspadinha não encontrada.');
    }

    if (card.coupleId !== coupleId) {
      throw new ApiError(403, 'Acesso não autorizado.');
    }

    if (card.isScratched) {
      throw new ApiError(400, 'Esta raspadinha já foi raspada.');
    }

    card.isScratched = true;
    card.scratchedAt = new Date();
    await card.save();

    return card;
  }
}

module.exports = new ScratchCardService();
