const express = require('express');
const Message = require('../models/Message');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 1. Obter todas as mensagens (Ordenadas por data de criação - mais antigas primeiro)
router.get('/', verificarToken, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar mensagens.' });
  }
});

// 2. Criar uma nova mensagem
router.post('/', verificarToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'O conteúdo da mensagem não pode estar vazio.' });
    }

    const message = new Message({
      sender: req.user.username,
      content: content.trim()
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// 3. Apagar uma mensagem (Apenas o autor ou admin pode apagar)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada.' });
    }

    // Verifica se é o autor ou se é um admin
    if (message.sender !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para apagar esta mensagem.' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mensagem apagada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar mensagem.' });
  }
});

module.exports = router;
