const BaseController = require('../baseController');
const ApiError = require('../../utils/apiError');

class AlbumController extends BaseController {
  constructor(albumRepository, photoRepository) {
    super(albumRepository, 'Álbum');
    this.photoRepository = photoRepository;
  }

  getAlbums = async (req, res, next) => {
    try {
      const albums = await this.repository.find({ coupleId: req.coupleId }, { createdAt: -1 });
      
      // Contar fotos para cada álbum
      const albumsComContagem = await Promise.all(albums.map(async (alb) => {
        const count = await this.photoRepository.countDocuments({ albumId: alb._id });
        const albObj = alb.toObject ? alb.toObject() : { ...alb };
        albObj.photoCount = count;
        return albObj;
      }));

      // Contar fotos que não pertencem a nenhum álbum (Geral)
      const generalPhotoCount = await this.photoRepository.countDocuments({ 
        coupleId: req.coupleId, 
        albumId: { $in: [null, undefined] } 
      });

      res.json({
        albums: albumsComContagem,
        generalPhotoCount
      });
    } catch (error) {
      next(this.handleError(error));
    }
  };

  createAlbum = async (req, res, next) => {
    try {
      const { name, description } = req.body;
      await this.createItem(req, res, next, {
        name,
        description: description ? description.trim() : ''
      });
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteAlbum = async (req, res, next) => {
    try {
      const album = await this.repository.findById(req.params.id);
      if (!album) {
        throw new ApiError(404, 'Álbum não encontrado.');
      }

      if (album.coupleId !== req.coupleId && req.user.role !== 'admin') {
        throw new ApiError(403, 'Não tens permissão para apagar este álbum.');
      }

      // Desassociar as fotos deste álbum
      await this.photoRepository.updateMany({ albumId: req.params.id }, { $unset: { albumId: "" } });

      await this.repository.findByIdAndDelete(req.params.id);
      res.json({ message: 'Álbum apagado com sucesso! As fotos foram mantidas no feed geral.' });
    } catch (error) {
      next(this.handleError(error));
    }
  };
}

module.exports = AlbumController;
