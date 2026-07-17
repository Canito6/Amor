const express = require('express');
const rateLimit = require('express-rate-limit');
const coupleController = require('../../controllers/couple/coupleController');
const { verificarToken } = require('../../middlewares/authMiddleware');
const router = express.Router();

// Limitador de taxa específico para a exportação de dados para proteger recursos do servidor
const exportLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  limit: process.env.NODE_ENV === 'test' ? 100 : 2, // Limite mais alto em testes para evitar falsos positivos
  message: { error: 'Apenas é permitido exportar dados a cada 5 minutos. Por favor, aguarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rotas de Exportação / Backup do Casal (GET /api/couple/export e GET /api/couple/export/pdf)
router.get('/export', verificarToken, exportLimiter, coupleController.exportData);
router.get('/export/pdf', verificarToken, exportLimiter, coupleController.exportPDF);

module.exports = router;
