const express = require('express');
const { verificarToken } = require('../middlewares/authMiddleware');
const tabController = require('../controllers/tabController');
const router = express.Router();

// Buscar todas as abas personalizadas do casal
router.get('/', verificarToken, tabController.getTabs);

// Criar uma nova aba personalizada
router.post('/', verificarToken, tabController.createTab);

// Atualizar uma aba personalizada (configurações ou notas/conteúdo)
router.put('/:id', verificarToken, tabController.updateTab);

// Eliminar uma aba personalizada
router.delete('/:id', verificarToken, tabController.deleteTab);

module.exports = router;
