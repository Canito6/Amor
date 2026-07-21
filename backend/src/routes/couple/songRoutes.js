const express = require('express');
const DailySong = require('../../models/couple/songModel');
const { verificarToken } = require('../../middlewares/authMiddleware');
const router = express.Router();

router.use(verificarToken);

// GET /api/couple/song - Obter a música do dia ativa do casal
router.get('/', async (req, res, next) => {
  try {
    const coupleId = req.user.coupleId;
    if (!coupleId) {
      return res.status(400).json({ error: 'Ainda não estás associado a um casal.' });
    }
    const song = await DailySong.findOne({ coupleId }).sort({ createdAt: -1 });
    res.json(song || null);
  } catch (err) {
    next(err);
  }
});

// POST /api/couple/song - Definir nova música do dia
router.post('/', async (req, res, next) => {
  try {
    const coupleId = req.user.coupleId;
    const { title, artist, audioUrl, externalUrl } = req.body;
    if (!title || !artist) {
      return res.status(400).json({ error: 'Título e artista são obrigatórios.' });
    }

    const song = await DailySong.create({
      coupleId,
      title,
      artist,
      audioUrl: audioUrl || '',
      externalUrl: externalUrl || '',
      setBy: req.user.username
    });

    res.status(201).json(song);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/couple/song/:id - Remover música do dia
router.delete('/:id', async (req, res, next) => {
  try {
    const song = await DailySong.findByIdAndDelete(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Música não encontrada.' });
    }
    res.json({ message: 'Música eliminada com sucesso.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
