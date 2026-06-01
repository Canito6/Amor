const express = require('express');
const multer = require('multer');
const { verificarToken } = require('../middlewares/authMiddleware');
const photoController = require('../controllers/photoController');
const router = express.Router();

// Configurar o multer para guardar ficheiros temporariamente na memória (Buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limite de 5MB por foto
});

// 1. Rota para obter todas as fotos (Mais recentes primeiro, suporta paginação opcional)
router.get('/', verificarToken, photoController.getPhotos);

// 2. Rota para fazer upload de uma foto para o Cloudinary e guardar no MongoDB
router.post('/upload', verificarToken, upload.single('image'), photoController.uploadPhoto);

// 3. Rota para apagar uma foto
router.delete('/:id', verificarToken, photoController.deletePhoto);

module.exports = router;
