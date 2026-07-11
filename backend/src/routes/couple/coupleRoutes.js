const express = require('express');
const coupleController = require('../../controllers/couple/coupleController');
const { verificarToken } = require('../../middlewares/authMiddleware');
const router = express.Router();

router.get('/couple-info', verificarToken, coupleController.getCoupleInfo);
router.post('/couple-info', verificarToken, coupleController.updateCoupleInfo);
router.post('/link-couple', verificarToken, coupleController.linkCouple);

module.exports = router;
