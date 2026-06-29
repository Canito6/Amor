const express = require('express');
const multer = require('multer');
const path = require('path'); // [SEGURANÇA - VULN-005] Requerido para verificar extensões
const coupleController = require('../../controllers/couple/coupleController');
const { verificarToken } = require('../../middlewares/authMiddleware');
const imageProcessor = require('../../middlewares/imageProcessor');
const router = express.Router();

// Configurar o multer para carregar avatar na memória com verificações de segurança
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // [SEGURANÇA - VULN-005] Validar MIME type e extensão de ficheiro para prevenir bypass
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas são permitidas imagens (JPEG, PNG, WEBP, GIF).'), false);
    }
  }
});

router.get('/couple-info', verificarToken, coupleController.getCoupleInfo);
router.post('/couple-info', verificarToken, coupleController.updateCoupleInfo);
router.post('/link-couple', verificarToken, coupleController.linkCouple);
router.post('/mood', verificarToken, coupleController.updateMood);
router.get('/couple-stats', verificarToken, coupleController.getCoupleStats);
router.post('/profile-avatar', verificarToken, upload.single('image'), imageProcessor, coupleController.uploadAvatar);

module.exports = router;
