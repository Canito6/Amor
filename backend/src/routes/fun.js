const express = require('express');
const scratchCardController = require('../controllers/scratchCardController');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Rotas de Raspadinhas do Amor
router.get('/scratch-cards', verificarToken, scratchCardController.getScratchCards);
router.post('/scratch-cards', verificarToken, scratchCardController.createScratchCard);
router.patch('/scratch-cards/:id/scratch', verificarToken, scratchCardController.scratchCard);
router.delete('/scratch-cards/:id', verificarToken, scratchCardController.deleteScratchCard);

module.exports = router;
