const Quiz = require('../models/Quiz');
const BaseController = require('./baseController');
const quizService = require('../services/quizService');

class QuizController extends BaseController {
  constructor() {
    super(Quiz, 'Quiz');
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
      const quiz = await quizService.guessQuiz(req.params.id, req.user.username, req.coupleId, guesses);
      res.json(quiz);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteQuiz = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = new QuizController();
