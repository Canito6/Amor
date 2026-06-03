const express = require('express');
const { verificarToken } = require('../middlewares/authMiddleware');
const messageController = require('../controllers/messageController');
const validate = require('../middlewares/validate');
const { messageSchema } = require('../utils/schemas');

const router = express.Router();

// 1. Obter todas as mensagens (Ordenadas por data de criação - mais antigas primeiro)
router.get('/', verificarToken, messageController.getMessages);

// 2. Criar uma nova mensagem
router.post('/', verificarToken, validate({ body: messageSchema }), messageController.createMessage);

// 3. Editar uma mensagem (Apenas o autor pode editar)
router.put('/:id', verificarToken, validate({ body: messageSchema }), messageController.editMessage);

// 4. Reagir a uma mensagem com Emoji
router.put('/:id/react', verificarToken, messageController.reactToMessage);

// 5. Apagar uma mensagem (Apenas o autor ou admin pode apagar)
router.delete('/:id', verificarToken, messageController.deleteMessage);

module.exports = router;
