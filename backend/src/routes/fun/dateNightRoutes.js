const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middlewares/authMiddleware');
const geminiService = require('../../services/ai/geminiService');

router.use(verificarToken);

router.post('/generate-ai', async (req, res, next) => {
  try {
    const theme = req.body?.theme || 'caseiro';
    const plan = await geminiService.generateDateNightPlan({ theme });
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
