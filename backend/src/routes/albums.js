const express = require('express');
const { verificarToken } = require('../middlewares/authMiddleware');
const albumController = require('../controllers/albumController');
const router = express.Router();

// 1. Obter todos os álbuns do casal com contagem de fotos (Mais recentes primeiro)
router.get('/', verificarToken, albumController.getAlbums);

// 2. Criar um novo álbum
router.post('/', verificarToken, albumController.createAlbum);

// 3. Apagar um álbum (Desassocia as fotos e apaga o álbum)
router.delete('/:id', verificarToken, albumController.deleteAlbum);

module.exports = router;
