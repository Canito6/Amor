const BaseController = require('../baseController');
const ApiError = require('../../utils/apiError');

class WordleController extends BaseController {
  constructor(wordleService, gameSessionRepository) {
    super(gameSessionRepository, 'GameSession');
    this.wordleService = wordleService;
  }

  async getSession(req, res, next) {
    try {
      const session = await this.wordleService.getOrCreateSession(req.coupleId);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async joinSession(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.wordleService.joinSession(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async makeGuess(req, res, next) {
    try {
      const username = req.user.username;
      const { guessWord } = req.body;

      if (!guessWord || typeof guessWord !== 'string') {
        throw new ApiError(400, 'Palavra de tentativa obrigatória.');
      }

      const session = await this.wordleService.makeGuess(req.coupleId, username, guessWord);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async setManualWord(req, res, next) {
    try {
      const username = req.user.username;
      const { word, hint } = req.body;

      if (!word || typeof word !== 'string') {
        throw new ApiError(400, 'Palavra secreta obrigatória.');
      }

      const session = await this.wordleService.setManualWord(req.coupleId, username, { word, hint });
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async updateSettings(req, res, next) {
    try {
      const username = req.user.username;
      const { mode } = req.body;
      const session = await this.wordleService.updateSettings(req.coupleId, username, { mode });
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }

  async resetGame(req, res, next) {
    try {
      const username = req.user.username;
      const session = await this.wordleService.resetGame(req.coupleId, username);
      res.json(session);
    } catch (error) {
      next(this.handleError(error));
    }
  }
}

module.exports = WordleController;
