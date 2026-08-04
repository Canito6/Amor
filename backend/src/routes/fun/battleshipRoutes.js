const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middlewares/authMiddleware');
const container = require('../../container');

const battleshipController = container.battleshipController;

router.use(verificarToken);

router.get('/', (req, res, next) => battleshipController.getSession(req, res, next));
router.post('/join', (req, res, next) => battleshipController.joinSession(req, res, next));
router.post('/setup', (req, res, next) => battleshipController.placeShips(req, res, next));
router.post('/attack', (req, res, next) => battleshipController.attack(req, res, next));
router.post('/dismiss-challenge', (req, res, next) => battleshipController.dismissChallenge(req, res, next));
router.post('/settings', (req, res, next) => battleshipController.updateSettings(req, res, next));
router.post('/reset', (req, res, next) => battleshipController.resetGame(req, res, next));

module.exports = router;
