const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middlewares/authMiddleware');
const container = require('../../container');

const gameSessionController = container.gameSessionController;

router.use(verificarToken);

router.get('/:gameType', (req, res, next) => gameSessionController.getSession(req, res, next));
router.post('/:gameType/join', (req, res, next) => gameSessionController.joinSession(req, res, next));
router.post('/:gameType/move', (req, res, next) => gameSessionController.makeMove(req, res, next));
router.post('/:gameType/reset', (req, res, next) => gameSessionController.resetSession(req, res, next));
router.post('/:gameType/customization', (req, res, next) => gameSessionController.updateCustomization(req, res, next));

module.exports = router;
