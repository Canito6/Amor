const BaseController = require('../baseController');
const ApiError = require('../../utils/apiError');

class TruthOrDareController extends BaseController {
  constructor(truthOrDareService, gameSessionRepository) {
    super(gameSessionRepository, 'GameSession');
    this.truthOrDareService = truthOrDareService;
  }

  async getSession(req, res, next) {
    try {
      const session = await this.truthOrDareService.getOrCreateSession(req.coupleId);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async joinSession(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.truthOrDareService.joinSession(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async drawCard(req, res, next) {
    try {
      const username = req.user.username;
      const { type, customText } = req.body;

      if (!type || !['truth', 'dare'].includes(type)) {
        throw new ApiError(400, 'Tipo inválido. Escolhe "truth" ou "dare".');
      }

      const session = await this.truthOrDareService.drawCard(req.coupleId, username, { type, customText });
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async completeCard(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.truthOrDareService.completeCard(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async refuseCard(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.truthOrDareService.refuseCard(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async completePenalty(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.truthOrDareService.completePenalty(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async updateSettings(req, res, next) {
    try {
      const username = req.user.username;
      const { level, mode } = req.body || {};

      const session = await this.truthOrDareService.updateSettings(req.coupleId, username, { level, mode });
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async resetGame(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.truthOrDareService.resetGame(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }
}

module.exports = TruthOrDareController;
