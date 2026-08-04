const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const validate = require('../../middlewares/validate');
const { couponSchema } = require('../../validations/fun/couponValidation');
const { couponController } = require('../../container');

const router = express.Router();

router.get('/', verificarToken, couponController.getCoupons);
router.post('/generate-ai', verificarToken, couponController.generateAI);
router.post('/', verificarToken, validate({ body: couponSchema }), couponController.createCoupon);
router.patch('/:id/redeem', verificarToken, couponController.redeemCoupon);
router.delete('/:id', verificarToken, couponController.deleteCoupon);

module.exports = router;
