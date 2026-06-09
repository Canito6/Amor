const express = require('express');
const multer = require('multer');
const { verificarToken } = require('../../middlewares/authMiddleware');
const bucketListController = require('../../controllers/fun/bucketItemController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
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
