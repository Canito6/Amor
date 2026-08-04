const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middlewares/authMiddleware');
const container = require('../../container');

const truthOrDareController = container.truthOrDareController;

router.use(verificarToken);

router.get('/', (req, res, next) => truthOrDareController.getSession(req, res, next));
router.post('/join', (req, res, next) => truthOrDareController.joinSession(req, res, next));
router.post('/draw', (req, res, next) => truthOrDareController.drawCard(req, res, next));
router.post('/complete', (req, res, next) => truthOrDareController.completeCard(req, res, next));
router.post('/refuse', (req, res, next) => truthOrDareController.refuseCard(req, res, next));
router.post('/complete-penalty', (req, res, next) => truthOrDareController.completePenalty(req, res, next));
router.post('/settings', (req, res, next) => truthOrDareController.updateSettings(req, res, next));
router.post('/reset', (req, res, next) => truthOrDareController.resetGame(req, res, next));

module.exports = router;
