const Album = require('../models/Album');
const Photo = require('../models/Photo');

exports.getAlbums = async (req, res) => {
  try {
    const albums = await Album.find({ coupleId: req.coupleId }).sort({ createdAt: -1 });
    
    // Contar fotos para cada álbum
    const albumsComContagem = await Promise.all(albums.map(async (alb) => {
      const count = await Photo.countDocuments({ albumId: alb._id });
      const albObj = alb.toObject();
      albObj.photoCount = count;
      return albObj;
    }));

    // Contar fotos que não pertencem a nenhum álbum (Geral)
    const generalPhotoCount = await Photo.countDocuments({ 
      coupleId: req.coupleId, 
      albumId: { $in: [null, undefined] } 
    });

    res.json({
      albums: albumsComContagem,
      generalPhotoCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar álbuns.' });
  }
};

exports.createAlbum = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'O nome do álbum é obrigatório.' });
    }

    const novoAlbum = new Album({
      name: name.trim(),
      description: description ? description.trim() : '',
      createdBy: req.user.username,
      coupleId: req.coupleId
    });

    await novoAlbum.save();
    res.status(201).json(novoAlbum);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar álbum.' });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Álbum não encontrado.' });
    }

    if (album.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para apagar este álbum.' });
    }

    // Desassociar as fotos deste álbum
    await Photo.updateMany({ albumId: req.params.id }, { $unset: { albumId: "" } });

    await Album.findByIdAndDelete(req.params.id);
    res.json({ message: 'Álbum apagado com sucesso! As fotos foram mantidas no feed geral.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar álbum.' });
  }
};
