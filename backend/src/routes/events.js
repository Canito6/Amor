const express = require('express');
const { verificarToken } = require('../middlewares/authMiddleware');
const eventController = require('../controllers/eventController');
const router = express.Router();

// 1. Obter todos os eventos do casal (Ordenados por data cronológica)
router.get('/', verificarToken, eventController.getEvents);

// 2. Criar um novo evento
router.post('/', verificarToken, eventController.createEvent);

// 3. Apagar um evento
router.delete('/:id', verificarToken, eventController.deleteEvent);

module.exports = router;
