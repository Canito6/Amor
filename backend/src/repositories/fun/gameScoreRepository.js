const BaseRepository = require('../baseRepository');
const GameScore = require('../../models/fun/gameScoreModel');

class GameScoreRepository extends BaseRepository {
  constructor() {
    super(GameScore);
  }

  async getScoreSummary(coupleId, period = 'all') {
    const matchQuery = { coupleId };

    if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchQuery.createdAt = { $gte: startOfMonth };
    }

    const aggregateResult = await this.model.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { username: '$username', gameType: '$gameType' },
          totalPoints: { $sum: '$points' },
          gamesCount: { $sum: 1 }
        }
      }
    ]);

    const totalCouplePointsResult = await this.model.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, grandTotal: { $sum: '$points' } } }
    ]);

    const totalCouplePoints = totalCouplePointsResult.length > 0 ? totalCouplePointsResult[0].grandTotal : 0;

    const byUser = {};
    const byGame = {};

    aggregateResult.forEach(item => {
      const { username, gameType } = item._id;
      const pts = item.totalPoints;

      if (!byUser[username]) {
        byUser[username] = 0;
      }
      byUser[username] += pts;

      if (!byGame[gameType]) {
        byGame[gameType] = 0;
      }
      byGame[gameType] += pts;
    });

    return {
      period,
      totalCouplePoints,
      byUser,
      byGame,
      breakdown: aggregateResult.map(item => ({
        username: item._id.username,
        gameType: item._id.gameType,
        totalPoints: item.totalPoints,
        gamesCount: item.gamesCount
      }))
    };
  }

  async deleteCoupleScores(coupleId) {
    return this.model.deleteMany({ coupleId });
  }
}

module.exports = GameScoreRepository;
