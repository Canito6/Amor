const BaseController = require('../baseController');

class LikelyController extends BaseController {
  constructor(likelyService, likelyRepository) {
    super(likelyRepository, 'Pergunta');
    this.likelyService = likelyService;
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
      const question = await this.likelyService.voteQuestion(req.params.id, req.user.username, votedFor, req.coupleId);
      res.json(question);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteLikelyQuestion = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = LikelyController;
