const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middlewares/authMiddleware');
const container = require('../../container');

const gameScoreController = container.gameScoreController;

router.use(verificarToken);

router.get('/summary', (req, res, next) => gameScoreController.getSummary(req, res, next));
router.post('/', (req, res, next) => gameScoreController.submitScore(req, res, next));
router.delete('/reset', (req, res, next) => gameScoreController.resetScores(req, res, next));

module.exports = router;
