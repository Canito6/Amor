const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { openWhenSchema } = require('../../validations/fun/openWhenValidation');
const { openWhenController } = require('../../container');

const router = express.Router();

router.get('/', verificarToken, openWhenController.getLetters);
router.post('/', verificarToken, validate({ body: openWhenSchema }), openWhenController.createLetter);
router.patch('/:id/open', verificarToken, openWhenController.openLetter);
router.delete('/:id', verificarToken, openWhenController.deleteLetter);

module.exports = router;
