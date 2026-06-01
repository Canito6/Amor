const express = require('express');
const Quiz = require('../models/Quiz');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 1. Obter todos os quizzes do casal
router.get('/', verificarToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ coupleId: req.coupleId }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar quizzes.' });
  }
});

// 2. Criar um novo quiz (Um parceiro define as perguntas e as suas respostas)
router.post('/', verificarToken, async (req, res) => {
  try {
    const { title, questions } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'O título do Quiz é obrigatório.' });
    }
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Deves adicionar pelo menos uma pergunta.' });
    }

    // Validar formato das perguntas
    for (const q of questions) {
      if (!q.questionText || !q.questionText.trim()) {
        return res.status(400).json({ error: 'Todas as perguntas têm de ter texto.' });
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ error: 'Cada pergunta precisa de pelo menos 2 opções.' });
      }
      if (!q.creatorAnswer || !q.options.includes(q.creatorAnswer)) {
        return res.status(400).json({ error: 'A resposta correta tem de constar nas opções.' });
      }
    }

    const novoQuiz = new Quiz({
      title: title.trim(),
      questions: questions.map(q => ({
        questionText: q.questionText.trim(),
        options: q.options.map(o => o.trim()),
        creatorAnswer: q.creatorAnswer.trim()
      })),
      createdBy: req.user.username,
      coupleId: req.coupleId
    });

    await novoQuiz.save();
    res.status(201).json(novoQuiz);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar quiz.' });
  }
});

// 3. Responder/Adivinhar um quiz (O parceiro envia os seus palpites)
router.put('/:id/guess', verificarToken, async (req, res) => {
  try {
    const { guesses } = req.body; // Array de strings correspondente às respostas
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }

    if (quiz.coupleId !== req.coupleId) {
      return res.status(403).json({ error: 'Acesso negado a este quiz.' });
    }

    if (quiz.createdBy === req.user.username) {
      return res.status(400).json({ error: 'Não podes responder ao teu próprio quiz!' });
    }

    if (quiz.completed) {
      return res.status(400).json({ error: 'Este quiz já foi respondido.' });
    }

    if (!guesses || !Array.isArray(guesses) || guesses.length !== quiz.questions.length) {
      return res.status(400).json({ error: 'Deves responder a todas as perguntas do quiz.' });
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
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao submeter respostas do quiz.' });
  }
});

// 4. Apagar um quiz
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }

    if (quiz.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para aceder a este quiz.' });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz apagado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar quiz.' });
  }
});

module.exports = router;
