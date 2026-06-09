const BaseController = require('../baseController');

class QuizController extends BaseController {
  constructor(quizService, quizRepository) {
    super(quizRepository, 'Quiz');
    this.quizService = quizService;
  }

  getQuizzes = async (req, res, next) => {
    await this.getAllItems(req, res, next);
  };

  createQuiz = async (req, res, next) => {
    await this.createItem(req, res, next);
  };

  guessQuiz = async (req, res, next) => {
    try {
      const { guesses } = req.body;
      const quiz = await this.quizService.guessQuiz(req.params.id, req.user.username, req.coupleId, guesses);
      res.json(quiz);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteQuiz = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = QuizController;
