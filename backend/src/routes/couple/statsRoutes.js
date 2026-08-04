const express = require('express');
const statsController = require('../../controllers/couple/statsController');
const { verificarToken } = require('../../middlewares/authMiddleware');
const router = express.Router();

router.get('/couple-stats', verificarToken, statsController.getCoupleStats);
router.get('/ai-insights', verificarToken, statsController.getAiInsights);

module.exports = router;
