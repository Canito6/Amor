const BaseRepository = require('../../repositories/baseRepository');
const Coupon = require('./coupon.model');

class CouponRepository extends BaseRepository {
  constructor() {
    super(Coupon);
  }
}

module.exports = CouponRepository;
