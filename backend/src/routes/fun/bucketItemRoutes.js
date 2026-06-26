const express = require('express');
const multer = require('multer');
const path = require('path'); // [SEGURANÇA - VULN-006] Requerido para verificar extensões
const { verificarToken } = require('../../middlewares/authMiddleware');
const bucketListController = require('../../controllers/fun/bucketItemController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // [SEGURANÇA - VULN-006] Prevenir MIME spoofing verificando MIME type e extensão de ficheiro de forma combinada
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

router.get('/', verificarToken, bucketListController.getBucketItems);
router.post('/', verificarToken, bucketListController.createBucketItem);
router.patch('/:id/complete', verificarToken, upload.single('image'), bucketListController.completeBucketItem);
router.delete('/:id', verificarToken, bucketListController.deleteBucketItem);

module.exports = router;
