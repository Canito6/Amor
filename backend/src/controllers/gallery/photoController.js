const Photo = require('../../models/gallery/photoModel');
const Album = require('../../models/gallery/albumModel'); // [SEGURANÇA - VULN-003] Requerido para verificar IDOR
const storageService = require('../../services/common/storageService');

exports.getPhotos = async (req, res) => {
  try {
    const { albumId } = req.query;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const filtro = { coupleId: req.coupleId };
    
    if (albumId) {
      if (albumId === 'sem-album') {
        filtro.albumId = { $in: [null, undefined] };
      } else {
        filtro.albumId = albumId;
      }
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      const photos = await Photo.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(limit);
      const totalPhotos = await Photo.countDocuments(filtro);
      res.json({
        photos,
        totalPhotos,
        totalPages: Math.ceil(totalPhotos / limit),
        currentPage: page
      });
    } else {
      const photos = await Photo.find(filtro).sort({ createdAt: -1 });
      res.json(photos);
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar fotos.' });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Por favor, seleciona um ficheiro de imagem.' });
    }

    const { caption, albumId } = req.body;

    // [SEGURANÇA - VULN-003] Validar se o álbum pertence ao mesmo casal (prevenir IDOR)
    if (albumId && albumId !== 'sem-album') {
      const album = await Album.findById(albumId);
      if (!album) {
        return res.status(404).json({ error: 'Álbum não encontrado.' });
      }
      if (album.coupleId !== req.coupleId) {
        return res.status(403).json({ error: 'Não tens permissão para associar fotos a este álbum.' });
      }
    }

    const resultado = await storageService.uploadFile(req.file.buffer);

    // Criar o registo no MongoDB com a URL segura do Cloudinary
    const novaFoto = new Photo({
      url: resultado.secure_url,
      caption: caption || '',
      uploadedBy: req.user.username,
      coupleId: req.coupleId,
      albumId: albumId && albumId !== 'sem-album' ? albumId : undefined
    });

    await novaFoto.save();
    res.status(201).json(novaFoto);
  } catch (error) {
    console.error('Erro no upload para o Cloudinary:', error);
    res.status(500).json({ error: 'Erro ao enviar a imagem para o Cloudinary.' });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ error: 'Foto não encontrada.' });
    }

    // Garante que o utilizador pertence ao mesmo casal da foto (ou é admin)
    if (photo.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para aceder a esta foto.' });
    }

    // Apenas quem fez upload ou admin pode apagar
    if (photo.uploadedBy !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para apagar esta foto.' });
    }

    // Tentamos também apagar do Cloudinary para poupar espaço
    await storageService.deleteFile(photo.url);

    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Foto apagada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar foto.' });
  }
};
