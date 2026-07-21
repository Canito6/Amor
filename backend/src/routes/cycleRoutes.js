const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware');
const CycleController = require('../controllers/cycleController');

const controller = new CycleController();

// Todos os endpoints requerem autenticação
router.use(verificarToken);

// CRUD de Entradas de Ciclo do próprio utilizador
router.get('/entries', controller.getEntries);
router.post('/entries', controller.createOrUpdateEntry);
router.delete('/entries/:id', controller.deleteEntry);
router.delete('/entries', controller.deleteAllEntries);

// Resumo e Previsões do próprio utilizador
router.get('/summary', controller.getSummary);

// Definições de Privacidade/Preferências do utilizador
router.patch('/preferences', controller.updatePreferences);

// Resumo para o Parceiro (Modo Parceiro)
router.get('/partner-summary', controller.getPartnerSummary);

module.exports = router;
