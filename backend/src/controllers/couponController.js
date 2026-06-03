const Coupon = require('../models/Coupon');
const BaseController = require('./baseController');
const couponService = require('../services/couponService');

class CouponController extends BaseController {
  constructor() {
    super(Coupon, 'Vale');
  }

  getCoupons = async (req, res, next) => {
    await this.getAllItems(req, res, next, {}, { status: 1, createdAt: -1 });
  };

  createCoupon = async (req, res, next) => {
    try {
      const { title, description, icon } = req.body;
      const newCoupon = new this.model({
        title,
        description,
        icon,
        coupleId: req.coupleId,
        createdBy: req.user.username
      });

      await newCoupon.save();

      const io = req.app.get('io');
      if (io) {
        io.to(req.coupleId).emit('update', { type: 'coupon-gifted', user: req.user.username, value: newCoupon.title });
      }

      res.status(201).json(newCoupon);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  redeemCoupon = async (req, res, next) => {
    try {
      const coupon = await couponService.redeemCoupon(req.params.id, req.coupleId);

      const io = req.app.get('io');
      if (io) {
        io.to(req.coupleId).emit('update', { type: 'coupon-redeemed', user: req.user.username, value: coupon.title });
      }

      res.json(coupon);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteCoupon = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = new CouponController();
