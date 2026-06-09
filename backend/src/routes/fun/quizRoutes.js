const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const { quizController } = require('../../container');
const validate = require('../../middlewares/validate');
const { quizSchema } = require('../../validations/fun/quizValidation');

const router = express.Router();

// 1. Obter todos os quizzes do casal
router.get('/', verificarToken, quizController.getQuizzes);

// 2. Criar um novo quiz (Um parceiro define as perguntas e as suas respostas)
router.post('/', verificarToken, validate({ body: quizSchema }), quizController.createQuiz);

// 3. Gerar um quiz com IA
router.post('/generate-ai', verificarToken, quizController.generateAIQuiz);

// 4. Responder/Adivinhar um quiz (O parceiro envia os seus palpites)
router.put('/:id/guess', verificarToken, quizController.guessQuiz);

// 5. Apagar um quiz
router.delete('/:id', verificarToken, quizController.deleteQuiz);

module.exports = router;
