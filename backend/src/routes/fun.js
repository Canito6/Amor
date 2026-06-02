const express = require('express');
const multer = require('multer');
const scratchCardController = require('../controllers/scratchCardController');
const decisionWheelController = require('../controllers/decisionWheelController');
const bucketListController = require('../controllers/bucketListController');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Configurar o multer para guardar ficheiros temporariamente na memória
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limite de 5MB por foto
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas são permitidas imagens (JPEG, PNG, WEBP, GIF).'), false);
    }
  }
});

// Rotas de Raspadinhas do Amor
router.get('/scratch-cards', verificarToken, scratchCardController.getScratchCards);
router.post('/scratch-cards', verificarToken, scratchCardController.createScratchCard);
router.patch('/scratch-cards/:id/scratch', verificarToken, scratchCardController.scratchCard);
router.delete('/scratch-cards/:id', verificarToken, scratchCardController.deleteScratchCard);

// Rotas da Roleta de Decisões
router.get('/decision-wheels', verificarToken, decisionWheelController.getDecisionWheels);
router.post('/decision-wheels', verificarToken, decisionWheelController.createDecisionWheel);
router.delete('/decision-wheels/:id', verificarToken, decisionWheelController.deleteDecisionWheel);

// Rotas da Bucket List
router.get('/bucket-items', verificarToken, bucketListController.getBucketItems);
router.post('/bucket-items', verificarToken, bucketListController.createBucketItem);
router.patch('/bucket-items/:id/complete', verificarToken, upload.single('image'), bucketListController.completeBucketItem);
router.delete('/bucket-items/:id', verificarToken, bucketListController.deleteBucketItem);

module.exports = router;
