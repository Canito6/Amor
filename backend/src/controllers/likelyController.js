const LikelyQuestion = require('../models/LikelyQuestion');
const BaseController = require('./baseController');
const likelyService = require('../services/likelyService');

class LikelyController extends BaseController {
  constructor() {
    super(LikelyQuestion, 'Pergunta');
  }

  getLikelyQuestions = async (req, res, next) => {
    await this.getAllItems(req, res, next);
  };

  createLikelyQuestion = async (req, res, next) => {
    await this.createItem(req, res, next);
  };

  voteLikelyQuestion = async (req, res, next) => {
    try {
      const { votedFor } = req.body;
      const question = await likelyService.voteQuestion(req.params.id, req.user.username, votedFor, req.coupleId);
      res.json(question);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteLikelyQuestion = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = new LikelyController();
