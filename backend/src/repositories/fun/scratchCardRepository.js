const BaseRepository = require('../baseRepository');
const ScratchCard = require('../../models/fun/scratchCardModel');

class ScratchCardRepository extends BaseRepository {
  constructor() {
    super(ScratchCard);
  }
}

module.exports = ScratchCardRepository;
