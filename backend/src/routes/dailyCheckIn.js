const express = require('express');
const dailyCheckInController = require('../controllers/dailyCheckInController');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verificarToken, dailyCheckInController.getDailyCheckIn);
router.post('/answer', verificarToken, dailyCheckInController.submitAnswer);

module.exports = router;
