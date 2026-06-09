const BaseController = require('../baseController');
const eventBus = require('../../utils/eventBus');

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
      
      try {
        eventBus.emit('socket:emit-update', {
          room: req.coupleId,
          type: 'quiz-answered',
          user: req.user.username,
          value: quiz.title
        });
      } catch (err) {
        // Ignorar erros
      }

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
