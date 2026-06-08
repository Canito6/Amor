const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { scratchCardSchema } = require('./scratchCard.schema');
const { scratchCardController } = require('../../container');

const router = express.Router();

router.get('/', verificarToken, scratchCardController.getScratchCards);
router.post('/', verificarToken, validate({ body: scratchCardSchema }), scratchCardController.createScratchCard);
router.patch('/:id/scratch', verificarToken, scratchCardController.scratchCard);
router.delete('/:id', verificarToken, scratchCardController.deleteScratchCard);

module.exports = router;
