const BaseRepository = require('./baseRepository');
const CycleEntry = require('../models/cycle/cycleEntryModel');

class CycleRepository extends BaseRepository {
  constructor() {
    super(CycleEntry);
  }

  async findByUserId(userId) {
    return this.model.find({ userId }).sort({ startDate: -1 });
  }

  async findByUserIdAndDate(userId, startDate) {
    return this.model.findOne({ userId, startDate });
  }

  async deleteAllForUser(userId) {
    return this.model.deleteMany({ userId });
  }
}

module.exports = CycleRepository;
