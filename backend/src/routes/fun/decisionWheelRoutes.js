const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { decisionWheelSchema } = require('../../validations/fun/decisionWheelValidation');
const { decisionWheelController } = require('../../container');

const router = express.Router();

router.get('/', verificarToken, decisionWheelController.getDecisionWheels);
router.post('/', verificarToken, validate({ body: decisionWheelSchema }), decisionWheelController.createDecisionWheel);
router.delete('/:id', verificarToken, decisionWheelController.deleteDecisionWheel);

module.exports = router;
