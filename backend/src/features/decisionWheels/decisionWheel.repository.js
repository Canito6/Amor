const BaseRepository = require('../../repositories/baseRepository');
const DecisionWheel = require('./decisionWheel.model');

class DecisionWheelRepository extends BaseRepository {
  constructor() {
    super(DecisionWheel);
  }
}

module.exports = DecisionWheelRepository;
