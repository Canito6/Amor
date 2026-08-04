const BaseController = require('../baseController');
const ApiError = require('../../utils/apiError');

class BattleshipController extends BaseController {
  constructor(battleshipService, gameSessionRepository) {
    super(gameSessionRepository, 'GameSession');
    this.battleshipService = battleshipService;
  }

  async getSession(req, res, next) {
    try {
      const session = await this.battleshipService.getOrCreateSession(req.coupleId);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async joinSession(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.battleshipService.joinSession(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async placeShips(req, res, next) {
    try {
      const username = req.user.username;
      const { shipPlacements } = req.body;
      const session = await this.battleshipService.placeShips(req.coupleId, username, shipPlacements);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async attack(req, res, next) {
    try {
      const username = req.user.username;
      const { targetIndex } = req.body;

      if (targetIndex === undefined || targetIndex === null) {
        throw new ApiError(400, 'Índice de ataque obrigatório.');
      }

      const session = await this.battleshipService.attack(req.coupleId, username, Number(targetIndex));
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async dismissChallenge(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.battleshipService.dismissChallenge(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async updateSettings(req, res, next) {
    try {
      const username = req.user.username;
      const { level, mode } = req.body;
      const session = await this.battleshipService.updateSettings(req.coupleId, username, { level, mode });
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async resetGame(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.battleshipService.resetGame(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }
}

module.exports = BattleshipController;
