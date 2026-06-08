const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { jarNoteSchema } = require('./jar.schema');
const { jarController } = require('../../container');

const router = express.Router();

router.get('/', verificarToken, jarController.getJarNotes);
router.get('/random', verificarToken, jarController.getRandomJarNote);
router.post('/', verificarToken, validate({ body: jarNoteSchema }), jarController.createJarNote);
router.delete('/:id', verificarToken, jarController.deleteJarNote);

module.exports = router;
