const BaseController = require('../baseController');
const { submitScoreSchema } = require('../../validations/fun/gameScoreValidation');
const ApiError = require('../../utils/apiError');

class GameScoreController extends BaseController {
  constructor(gameScoreService, gameScoreRepository) {
    super(gameScoreRepository, 'GameScore');
    this.gameScoreService = gameScoreService;
  }

  async getSummary(req, res, next) {
    try {
      const period = req.query.period || 'all';
      const summary = await this.gameScoreService.getSummary(req.coupleId, period);
      res.json(summary);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async submitScore(req, res, next) {
    try {
      const validatedData = submitScoreSchema.parse(req.body);
      const username = req.user ? req.user.username : req.body.username;

      const record = await this.gameScoreService.submitClientScore(
        req.coupleId,
        username,
        validatedData.gameType,
        validatedData.points,
        validatedData.metadata || {}
      );

      res.status(201).json(record);
    } catch (error) {
      if (error.name === 'ZodError') {
        const msg = error.errors.map(e => e.message).join(', ');
        return next(new ApiError(400, msg));
      }
      next(this.handleError(error));
    }
  }

  async resetScores(req, res, next) {
    try {
      const username = req.user ? req.user.username : 'user';
      const result = await this.gameScoreService.resetScores(req.coupleId, username);
      res.json(result);
    } catch (error) {
      next(this.handleError(error));
    }
  }
}

module.exports = GameScoreController;
