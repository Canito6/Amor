const express = require('express');
const router = express.Router();
const Tab = require('../models/Tab');
const { verificarToken } = require('../middlewares/authMiddleware');

// Buscar todas as abas personalizadas do casal
router.get('/', verificarToken, async (req, res) => {
  try {
    const tabs = await Tab.find({ coupleId: req.coupleId }).sort({ order: 1 });
    res.json(tabs);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar as abas personalizadas.' });
  }
});

// Criar uma nova aba personalizada
router.post('/', verificarToken, async (req, res) => {
  try {
    const { title, icon, accentColor, bgGradient, contentType, content, order } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'O título da aba é obrigatório.' });
    }
    const newTab = new Tab({
      title,
      icon: icon || '❤️',
      accentColor: accentColor || '#ff4d6d',
      bgGradient: bgGradient || 'linear-gradient(135deg, #ffccd5, #ffcad4)',
      contentType: contentType || 'notes',
      content: content || '',
      order: order || 0,
      coupleId: req.coupleId
    });
    await newTab.save();
    res.status(201).json(newTab);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Erro ao criar a aba personalizada.' });
  }
});

// Atualizar uma aba personalizada (configurações ou notas/conteúdo)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { title, icon, accentColor, bgGradient, contentType, content, order } = req.body;
    const tab = await Tab.findOne({ _id: req.params.id, coupleId: req.coupleId });
    
    if (!tab) {
      return res.status(404).json({ error: 'Aba não encontrada ou sem permissão.' });
    }
    
    if (title !== undefined) tab.title = title;
    if (icon !== undefined) tab.icon = icon;
    if (accentColor !== undefined) tab.accentColor = accentColor;
    if (bgGradient !== undefined) tab.bgGradient = bgGradient;
    if (contentType !== undefined) tab.contentType = contentType;
    if (content !== undefined) tab.content = content;
    if (order !== undefined) tab.order = order;
    
    await tab.save();
    res.json(tab);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Erro ao atualizar a aba.' });
  }
});

// Eliminar uma aba personalizada
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const tab = await Tab.findOneAndDelete({ _id: req.params.id, coupleId: req.coupleId });
    if (!tab) {
      return res.status(404).json({ error: 'Aba não encontrada ou sem permissão.' });
    }
    res.json({ message: 'Aba eliminada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao eliminar a aba.' });
  }
});

module.exports = router;
