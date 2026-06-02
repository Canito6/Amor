const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const BucketItem = require('../models/BucketItem');

// Configurar o Cloudinary com as chaves do ficheiro .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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

// Obter todos os itens da bucket list do casal
exports.getBucketItems = async (req, res) => {
  try {
    const items = await BucketItem.find({ coupleId: req.coupleId })
      .sort({ completed: 1, createdAt: -1 }); // Pendentes primeiro, depois mais recentes
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter a lista de desejos.' });
  }
};

// Criar um novo item na bucket list
exports.createBucketItem = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título do desejo é obrigatório.' });
    }

    const newItem = new BucketItem({
      title: title.trim(),
      description: description ? description.trim() : '',
      coupleId: req.coupleId,
      createdBy: req.user.username
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o desejo.' });
  }
};

// Concluir/Desmarcar item da bucket list
exports.completeBucketItem = async (req, res) => {
  try {
    const item = await BucketItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Desejo não encontrado.' });
    }

    if (item.coupleId !== req.coupleId) {
      return res.status(403).json({ error: 'Não tens permissão para alterar este item.' });
    }

    const { completed } = req.body;

    // Se completed for falso (desmarcar o item)
    if (completed === 'false' || completed === false) {
      // Se tinha imagem no Cloudinary, vamos tentar apagá-la
      if (item.imageUrl) {
        try {
          const urlParts = item.imageUrl.split('/');
          const folderAndFile = urlParts.slice(-2).join('/');
          const publicId = folderAndFile.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (errCloudinary) {
          console.error('Erro ao apagar imagem do desejo no Cloudinary:', errCloudinary);
        }
      }

      item.completed = false;
      item.completedBy = '';
      item.completedAt = null;
      item.imageUrl = '';
    } else {
      // Marcar como concluído
      item.completed = true;
      item.completedBy = req.user.username;
      item.completedAt = new Date();

      // Se houver upload de imagem
      if (req.file) {
        const resultado = await uploadParaCloudinary(req.file.buffer);
        item.imageUrl = resultado.secure_url;
      }
    }

    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Erro ao concluir item da bucket list:', error);
    res.status(500).json({ error: 'Erro ao atualizar o desejo.' });
  }
};

// Eliminar um item da bucket list
exports.deleteBucketItem = async (req, res) => {
  try {
    const item = await BucketItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Desejo não encontrado.' });
    }

    if (item.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para eliminar este item.' });
    }

    // Se tinha imagem no Cloudinary, vamos apagar
    if (item.imageUrl) {
      try {
        const urlParts = item.imageUrl.split('/');
        const folderAndFile = urlParts.slice(-2).join('/');
        const publicId = folderAndFile.split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (errCloudinary) {
        console.error('Erro ao apagar imagem do desejo no Cloudinary ao eliminar:', errCloudinary);
      }
    }

    await BucketItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Desejo eliminado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar o desejo.' });
  }
};
