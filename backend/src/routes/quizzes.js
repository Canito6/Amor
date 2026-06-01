const express = require('express');
const { verificarToken } = require('../middlewares/authMiddleware');
const quizController = require('../controllers/quizController');
const router = express.Router();

// 1. Obter todos os quizzes do casal
router.get('/', verificarToken, quizController.getQuizzes);

// 2. Criar um novo quiz (Um parceiro define as perguntas e as suas respostas)
router.post('/', verificarToken, quizController.createQuiz);

// 3. Responder/Adivinhar um quiz (O parceiro envia os seus palpites)
router.put('/:id/guess', verificarToken, quizController.guessQuiz);

// 4. Apagar um quiz
router.delete('/:id', verificarToken, quizController.deleteQuiz);

module.exports = router;
