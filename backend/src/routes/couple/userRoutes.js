const express = require('express');
const multer = require('multer');
const path = require('path');
const userController = require('../../controllers/user/userController');
const { verificarToken } = require('../../middlewares/authMiddleware');
const imageProcessor = require('../../middlewares/imageProcessor');
const router = express.Router();

// Configurar o multer para carregar avatar na memória com verificações de segurança
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
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

router.post('/mood', verificarToken, userController.updateMood);
router.post('/profile-avatar', verificarToken, upload.single('image'), imageProcessor, userController.uploadAvatar);

module.exports = router;
