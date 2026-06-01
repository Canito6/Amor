const express = require('express');
const Memory = require('../models/Memory');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 1. Obter todas as memórias cronologicamente (Mais antigas primeiro, para a Timeline)
router.get('/', verificarToken, async (req, res) => {
  try {
    const memories = await Memory.find().sort({ date: 1 });
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar memórias.' });
  }
});

// 2. Criar uma nova memória
router.post('/', verificarToken, async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título do momento especial é obrigatório.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'A data do momento é obrigatória.' });
    }

    const novaMemoria = new Memory({
      title: title.trim(),
      description: description ? description.trim() : '',
      date: new Date(date),
      createdBy: req.user.username
    });

    await novaMemoria.save();
    res.status(201).json(novaMemoria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar memória.' });
  }
});

// 3. Apagar uma memória
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memória não encontrada.' });
    }

    // Verifica se é o autor ou se é um admin
    if (memory.createdBy !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para apagar este momento.' });
    }

    await Memory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Momento especial apagado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar memória.' });
  }
});

module.exports = router;
