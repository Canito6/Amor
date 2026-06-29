const express = require('express');
const multer = require('multer');
const path = require('path'); // [SEGURANÇA - VULN-006] Requerido para verificar extensões
const { verificarToken } = require('../../middlewares/authMiddleware');
const imageProcessor = require('../../middlewares/imageProcessor');
const photoController = require('../../controllers/gallery/photoController');
const router = express.Router();

// Configurar o multer para guardar ficheiros temporariamente na memória (Buffer) com verificações reforçadas
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limite de 5MB por foto
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

// 1. Rota para obter todas as fotos (Mais recentes primeiro, suporta paginação opcional)
router.get('/', verificarToken, photoController.getPhotos);

// 2. Rota para fazer upload de uma foto para o Cloudinary e guardar no MongoDB
router.post('/upload', verificarToken, upload.single('image'), imageProcessor, photoController.uploadPhoto);

// 3. Rota para apagar uma foto
router.delete('/:id', verificarToken, photoController.deletePhoto);

module.exports = router;
