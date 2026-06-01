const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const Photo = require('../models/Photo');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Configurar o Cloudinary com as chaves do ficheiro .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar o multer para guardar ficheiros temporariamente na memória (Buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limite de 5MB por foto
});

// Helper para fazer upload de um buffer de ficheiro para o Cloudinary via Stream
const uploadParaCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'o-nosso-cantinho' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

// 1. Rota para obter todas as fotos (Mais recentes primeiro)
router.get('/', verificarToken, async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar fotos.' });
  }
});

// 2. Rota para fazer upload de uma foto para o Cloudinary e guardar no MongoDB
router.post('/upload', verificarToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Por favor, seleciona um ficheiro de imagem.' });
    }

    const { caption } = req.body;

    // Enviar o buffer do ficheiro para o Cloudinary
    const resultado = await uploadParaCloudinary(req.file.buffer);

    // Criar o registo no MongoDB com a URL segura do Cloudinary
    const novaFoto = new Photo({
      url: resultado.secure_url,
      caption: caption || '',
      uploadedBy: req.user.username
    });

    await novaFoto.save();
    res.status(201).json(novaFoto);
  } catch (error) {
    console.error('Erro no upload para o Cloudinary:', error);
    res.status(500).json({ error: 'Erro ao enviar a imagem para o Cloudinary.' });
  }
});

// 3. Rota para apagar uma foto
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Foto não encontrada.' });
    }

    // Apenas quem fez upload ou admin pode apagar
    if (photo.uploadedBy !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para apagar esta foto.' });
    }

    // Tentamos também apagar do Cloudinary para poupar espaço
    try {
      // Extrair o public_id da URL (ex: o-nosso-cantinho/nome_imagem)
      // As URLs do cloudinary são do tipo: https://res.cloudinary.com/cloud_name/image/upload/v12345/o-nosso-cantinho/public_id.jpg
      const urlParts = photo.url.split('/');
      const folderAndFile = urlParts.slice(-2).join('/'); // Retorna "o-nosso-cantinho/ficheiro.jpg"
      const publicId = folderAndFile.split('.')[0]; // Retorna "o-nosso-cantinho/ficheiro"
      await cloudinary.uploader.destroy(publicId);
    } catch (errCloudinary) {
      console.error('Erro ao apagar imagem no Cloudinary:', errCloudinary);
    }

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Foto apagada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar foto.' });
  }
});

module.exports = router;
