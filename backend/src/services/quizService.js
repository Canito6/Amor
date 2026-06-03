const Quiz = require('../models/Quiz');
const ApiError = require('../utils/apiError');

class QuizService {
  async guessQuiz(id, username, coupleId, guesses) {
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      throw new ApiError(404, 'Quiz não encontrado.');
    }

    if (quiz.coupleId !== coupleId) {
      throw new ApiError(403, 'Acesso negado a este quiz.');
    }

    if (quiz.createdBy === username) {
      throw new ApiError(400, 'Não podes responder ao teu próprio quiz!');
    }

    if (quiz.completed) {
      throw new ApiError(400, 'Este quiz já foi respondido.');
    }

    if (!guesses || !Array.isArray(guesses) || guesses.length !== quiz.questions.length) {
      throw new ApiError(400, 'Deves responder a todas as perguntas do quiz.');
    }

    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      const userGuess = guesses[i];
      quiz.questions[i].partnerGuess = userGuess;
      if (userGuess === quiz.questions[i].creatorAnswer) {
        score++;
      }
    }

    quiz.completed = true;
    quiz.score = score;

    await quiz.save();
    return quiz;
  }
}

module.exports = new QuizService();
