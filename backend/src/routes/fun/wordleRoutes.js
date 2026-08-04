const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middlewares/authMiddleware');
const container = require('../../container');

const wordleController = container.wordleController;

router.use(verificarToken);

router.get('/', (req, res, next) => wordleController.getSession(req, res, next));
router.post('/join', (req, res, next) => wordleController.joinSession(req, res, next));
router.post('/guess', (req, res, next) => wordleController.makeGuess(req, res, next));
router.post('/set-word', (req, res, next) => wordleController.setManualWord(req, res, next));
router.post('/settings', (req, res, next) => wordleController.updateSettings(req, res, next));
router.post('/reset', (req, res, next) => wordleController.resetGame(req, res, next));

module.exports = router;
