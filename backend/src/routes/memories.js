const express = require('express');
const Memory = require('../models/Memory');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// 1. Obter todas as memórias cronologicamente (Mais antigas primeiro, para a Timeline)
router.get('/', verificarToken, async (req, res) => {
  try {
    const memories = await Memory.find({ coupleId: req.coupleId }).sort({ date: 1 });
    
    // Processar memórias para ocultar detalhes de cápsulas trancadas
    const processedMemories = memories.map(mem => {
      const isLocked = mem.isTimeCapsule && mem.unlockDate && new Date(mem.unlockDate) > new Date();
      if (isLocked) {
        // Retorna objeto simplificado sem a descrição nem o título real
        return {
          _id: mem._id,
          title: 'Cápsula do Tempo Trancada 🔒',
          description: '',
          date: mem.date,
          createdBy: mem.createdBy,
          createdAt: mem.createdAt,
          isTimeCapsule: true,
          unlockDate: mem.unlockDate,
          locked: true
        };
      }
      
      // Retorna a memória normal convertida para objeto simples, adicionando locked: false
      const memObj = mem.toObject();
      memObj.locked = false;
      return memObj;
    });

    res.json(processedMemories);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar memórias.' });
  }
});

// 2. Criar uma nova memória
router.post('/', verificarToken, async (req, res) => {
  try {
    const { title, description, date, isTimeCapsule, unlockDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título do momento especial é obrigatório.' });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({ error: 'O título não pode ter mais de 100 caracteres.' });
    }
    if (description && description.trim().length > 1000) {
      return res.status(400).json({ error: 'A descrição não pode ter mais de 1000 caracteres.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'A data do momento é obrigatória.' });
    }
    if (isTimeCapsule && !unlockDate) {
      return res.status(400).json({ error: 'A data de abertura da Cápsula do Tempo é obrigatória.' });
    }

    const novaMemoria = new Memory({
      title: title.trim(),
      description: description ? description.trim() : '',
      date: new Date(date),
      createdBy: req.user.username,
      coupleId: req.coupleId,
      isTimeCapsule: !!isTimeCapsule,
      unlockDate: isTimeCapsule ? new Date(unlockDate) : null
    });

    await novaMemoria.save();
    
    // Retorna a memória com campo locked incluído para consistência no frontend
    const memObj = novaMemoria.toObject();
    const isLocked = memObj.isTimeCapsule && memObj.unlockDate && new Date(memObj.unlockDate) > new Date();
    memObj.locked = isLocked;
    if (isLocked) {
      memObj.title = 'Cápsula do Tempo Trancada 🔒';
      memObj.description = '';
    }
    
    res.status(201).json(memObj);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar memória.' });
  }
});

// 3. Editar uma memória (Apenas quem criou ou admin)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { title, description, date, isTimeCapsule, unlockDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título do momento especial é obrigatório.' });
    }
    if (title.trim().length > 100) {
      return res.status(400).json({ error: 'O título não pode ter mais de 100 caracteres.' });
    }
    if (description && description.trim().length > 1000) {
      return res.status(400).json({ error: 'A descrição não pode ter mais de 1000 caracteres.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'A data do momento é obrigatória.' });
    }
    if (isTimeCapsule && !unlockDate) {
      return res.status(400).json({ error: 'A data de abertura da Cápsula do Tempo é obrigatória.' });
    }

    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memória não encontrada.' });
    }

    // Garante que o utilizador pertence ao mesmo casal (ou é admin)
    if (memory.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para aceder a esta memória.' });
    }

    // Apenas o criador ou admin pode editar
    if (memory.createdBy !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para editar este momento.' });
    }

    memory.title = title.trim();
    memory.description = description ? description.trim() : '';
    memory.date = new Date(date);
    memory.isTimeCapsule = !!isTimeCapsule;
    memory.unlockDate = isTimeCapsule ? new Date(unlockDate) : null;
    
    // Se a data de desbloqueio foi alterada para o futuro, reset notified para podermos notificar de novo!
    if (isTimeCapsule && memory.unlockDate > new Date()) {
      memory.notified = false;
    }

    await memory.save();

    const memObj = memory.toObject();
    const isLocked = memObj.isTimeCapsule && memObj.unlockDate && new Date(memObj.unlockDate) > new Date();
    memObj.locked = isLocked;
    if (isLocked) {
      memObj.title = 'Cápsula do Tempo Trancada 🔒';
      memObj.description = '';
    }

    res.json(memObj);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar memória.' });
  }
});

// 3. Apagar uma memória
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memória não encontrada.' });
    }

    // Garante que o utilizador pertence ao mesmo casal (ou é admin)
    if (memory.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para aceder a esta memória.' });
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
