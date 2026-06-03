const express = require('express');
const { verificarToken } = require('../middlewares/authMiddleware');
const tabController = require('../controllers/tabController');
const validate = require('../middlewares/validate');
const { tabSchema } = require('../utils/schemas');

const router = express.Router();

// Buscar todas as abas personalizadas do casal
router.get('/', verificarToken, tabController.getTabs);

// Criar uma nova aba personalizada
router.post('/', verificarToken, validate({ body: tabSchema }), tabController.createTab);

// Atualizar uma aba personalizada (configurações ou notas/conteúdo)
router.put('/:id', verificarToken, validate({ body: tabSchema }), tabController.updateTab);

// Eliminar uma aba personalizada
router.delete('/:id', verificarToken, tabController.deleteTab);

module.exports = router;
