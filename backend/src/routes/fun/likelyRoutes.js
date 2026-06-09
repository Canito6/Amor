const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { likelyQuestionSchema, voteLikelySchema } = require('../../validations/fun/likelyValidation');
const { likelyController } = require('../../container');

const router = express.Router();

router.get('/', verificarToken, likelyController.getLikelyQuestions);
router.post('/', verificarToken, validate({ body: likelyQuestionSchema }), likelyController.createLikelyQuestion);
router.patch('/:id/vote', verificarToken, validate({ body: voteLikelySchema }), likelyController.voteLikelyQuestion);
router.delete('/:id', verificarToken, likelyController.deleteLikelyQuestion);

module.exports = router;
