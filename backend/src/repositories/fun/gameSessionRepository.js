const BaseRepository = require('../baseRepository');
const GameSession = require('../../models/fun/gameSessionModel');

class GameSessionRepository extends BaseRepository {
  constructor() {
    super(GameSession);
  }

  async findByCoupleAndGame(coupleId, gameType = 'tic-tac-toe') {
    return this.findOne({ coupleId, gameType }, false);
  }

  async createOrResetSession(coupleId, gameType = 'tic-tac-toe', initialData = {}) {
    const existing = await this.findOne({ coupleId, gameType });
    if (existing) {
      return this.findByIdAndUpdate(existing._id, {
        $set: {
          ...initialData,
          updatedAt: new Date()
        }
      }, { new: true });
    }

    return this.create({
      coupleId,
      gameType,
      ...initialData
    });
  }
}

module.exports = GameSessionRepository;
