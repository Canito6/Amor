const BaseRepository = require('../../repositories/baseRepository');
const ScratchCard = require('./scratchCard.model');

class ScratchCardRepository extends BaseRepository {
  constructor() {
    super(ScratchCard);
  }
}

module.exports = ScratchCardRepository;
