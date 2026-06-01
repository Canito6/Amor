const express = require('express');
const { verificarToken } = require('../middlewares/authMiddleware');
const memoryController = require('../controllers/memoryController');
const router = express.Router();

// 1. Obter todas as memórias cronologicamente (Timeline)
router.get('/', verificarToken, memoryController.getMemories);

// 2. Criar uma nova memória
router.post('/', verificarToken, memoryController.createMemory);

// 3. Editar uma memória (Apenas quem criou ou admin)
router.put('/:id', verificarToken, memoryController.editMemory);

// 4. Apagar uma memória
router.delete('/:id', verificarToken, memoryController.deleteMemory);

module.exports = router;
