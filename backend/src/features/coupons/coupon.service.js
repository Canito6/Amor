const ApiError = require('../../utils/apiError');

class CouponService {
  constructor(couponRepository) {
    this.couponRepository = couponRepository;
  }

  async redeemCoupon(id, coupleId) {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new ApiError(404, 'Vale não encontrado.');
    }

    if (coupon.coupleId !== coupleId) {
      throw new ApiError(403, 'Não tens permissão para resgatar este vale.');
    }

    if (coupon.status === 'redeemed') {
      throw new ApiError(400, 'Este vale já foi utilizado!');
    }

    coupon.status = 'redeemed';
    coupon.redeemedAt = new Date();
    await coupon.save();

    return coupon;
  }
}

module.exports = CouponService;
