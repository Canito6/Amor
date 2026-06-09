const BaseRepository = require('../baseRepository');
const Coupon = require('../../models/fun/couponModel');

class CouponRepository extends BaseRepository {
  constructor() {
    super(Coupon);
  }
}

module.exports = CouponRepository;
