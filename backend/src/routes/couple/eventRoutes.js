const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const { eventController } = require('../../container');
const validate = require('../../middlewares/validate');
const { eventSchema } = require('../../validations/couple/eventValidation');

const router = express.Router();

// 1. Obter todos os eventos do casal (Ordenados por data cronológica)
router.get('/', verificarToken, eventController.getEvents);

// 2. Criar um novo evento
router.post('/', verificarToken, validate({ body: eventSchema }), eventController.createEvent);

// 3. Apagar um evento
router.delete('/:id', verificarToken, eventController.deleteEvent);

module.exports = router;
