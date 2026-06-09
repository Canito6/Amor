const BaseRepository = require('../baseRepository');
const DecisionWheel = require('../../models/fun/decisionWheelModel');

class DecisionWheelRepository extends BaseRepository {
  constructor() {
    super(DecisionWheel);
  }
}

module.exports = DecisionWheelRepository;
