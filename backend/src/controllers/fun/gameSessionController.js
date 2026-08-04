const BaseController = require('../baseController');
const { makeMoveSchema } = require('../../validations/fun/gameSessionValidation');
const ApiError = require('../../utils/apiError');

class GameSessionController extends BaseController {
  constructor(gameSessionService, gameSessionRepository) {
    super(gameSessionRepository, 'GameSession');
    this.gameSessionService = gameSessionService;
  }

  async getSession(req, res, next) {
    try {
      const gameType = req.params.gameType || 'tic-tac-toe';
      const session = await this.gameSessionService.getOrCreateSession(req.coupleId, gameType);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async joinSession(req, res, next) {
    try {
      const gameType = req.params.gameType || 'tic-tac-toe';
      const username = req.user.username;
      const session = await this.gameSessionService.joinSession(req.coupleId, username, gameType);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async makeMove(req, res, next) {
    try {
      const gameType = req.params.gameType || 'tic-tac-toe';
      const validatedData = makeMoveSchema.parse(req.body);
      const username = req.user.username;

      const session = await this.gameSessionService.makeMove(req.coupleId, username, validatedData.index, gameType);
      res.json(session);
    } catch (error) {
      if (error.name === 'ZodError') {
        const msg = error.errors.map(e => e.message).join(', ');
        return next(new ApiError(400, msg));
      }
      next(this.handleError(error));
    }
  }

  async resetSession(req, res, next) {
    try {
      const gameType = req.params.gameType || 'tic-tac-toe';
      const username = req.user.username;

      const session = await this.gameSessionService.resetSession(req.coupleId, username, gameType);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async updateCustomization(req, res, next) {
    try {
      const gameType = req.params.gameType || 'tic-tac-toe';
      const username = req.user.username;
      const { emoji, color } = req.body;

      const session = await this.gameSessionService.updateCustomization(req.coupleId, username, gameType, { emoji, color });
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async updateGameSettings(req, res, next) {
    try {
      const gameType = req.params.gameType || 'tic-tac-toe';
      const username = req.user.username;
      const { consequencesEnabled, consequenceLevel } = req.body;

      const session = await this.gameSessionService.updateGameSettings(req.coupleId, username, gameType, { consequencesEnabled, consequenceLevel });
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }
}

module.exports = GameSessionController;
