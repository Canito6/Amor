const LikelyQuestion = require('../models/LikelyQuestion');

exports.getLikelyQuestions = async (req, res) => {
  try {
    const questions = await LikelyQuestion.find({ coupleId: req.coupleId })
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter as perguntas.' });
  }
};

exports.createLikelyQuestion = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'O texto da pergunta é obrigatório.' });
    }

    const newQuestion = new LikelyQuestion({
      text: text.trim(),
      votes: [],
      isMatched: false,
      coupleId: req.coupleId,
      createdBy: req.user.username
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar a pergunta.' });
  }
};

exports.voteLikelyQuestion = async (req, res) => {
  try {
    const { votedFor } = req.body;
    if (!votedFor) {
      return res.status(400).json({ error: 'Deves votar em alguém!' });
    }

    const question = await LikelyQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Pergunta não encontrada.' });
    }

    if (question.coupleId !== req.coupleId) {
      return res.status(403).json({ error: 'Não tens permissão para aceder a esta pergunta.' });
    }

    // Verificar se já votou nesta pergunta
    const alreadyVoted = question.votes.some(v => v.voter === req.user.username);
    if (alreadyVoted) {
      return res.status(400).json({ error: 'Já registaste o teu voto para esta pergunta!' });
    }

    // Adicionar voto
    question.votes.push({
      voter: req.user.username,
      votedFor: votedFor.trim()
    });

    // Se ambos votaram (2 votos), calcular match
    if (question.votes.length === 2) {
      const vote1 = question.votes[0].votedFor;
      const vote2 = question.votes[1].votedFor;
      // Se ambos votaram na mesma pessoa, é um Match!
      question.isMatched = (vote1.toLowerCase() === vote2.toLowerCase());
    }

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registar o voto.' });
  }
};

exports.deleteLikelyQuestion = async (req, res) => {
  try {
    const question = await LikelyQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Pergunta não encontrada.' });
    }

    if (question.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para eliminar esta pergunta.' });
    }

    await LikelyQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pergunta eliminada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar a pergunta.' });
  }
};
