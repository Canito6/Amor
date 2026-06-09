const express = require('express');
const multer = require('multer');
const coupleController = require('../../controllers/couple/coupleController');
const { verificarToken } = require('../../middlewares/authMiddleware');
const router = express.Router();

// Configurar o multer para carregar avatar na memória
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/couple-info', verificarToken, coupleController.getCoupleInfo);
router.post('/couple-info', verificarToken, coupleController.updateCoupleInfo);
router.post('/link-couple', verificarToken, coupleController.linkCouple);
router.post('/mood', verificarToken, coupleController.updateMood);
router.get('/couple-stats', verificarToken, coupleController.getCoupleStats);
router.post('/profile-avatar', verificarToken, upload.single('image'), coupleController.uploadAvatar);

module.exports = router;
