const BaseController = require('../baseController');
const eventBus = require('../../utils/eventBus');

class CouponController extends BaseController {
  constructor(couponService, couponRepository) {
    super(couponRepository, 'Vale');
    this.couponService = couponService;
  }

  getCoupons = async (req, res, next) => {
    await this.getAllItems(req, res, next, {}, { status: 1, createdAt: -1 });
  };

  createCoupon = async (req, res, next) => {
    try {
      const { title, description, icon } = req.body;
      const newCoupon = await this.repository.create({
        title,
        description,
        icon,
        coupleId: req.coupleId,
        createdBy: req.user.username
      });

      eventBus.emit('socket:emit-update', {
        room: req.coupleId,
        type: 'coupon-gifted',
        user: req.user.username,
        value: newCoupon.title
      });

      res.status(201).json(newCoupon);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  redeemCoupon = async (req, res, next) => {
    try {
      const coupon = await this.couponService.redeemCoupon(req.params.id, req.coupleId);

      eventBus.emit('socket:emit-update', {
        room: req.coupleId,
        type: 'coupon-redeemed',
        user: req.user.username,
        value: coupon.title
      });

      res.json(coupon);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteCoupon = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };

  generateAI = async (req, res, next) => {
    try {
      const geminiService = require('../../services/ai/geminiService');
      const type = req.body?.type || 'mimo';
      const couponIdea = await geminiService.generateCouponIdea({ type });
      res.json(couponIdea);
    } catch (error) {
      next(this.handleError(error));
    }
  };
}

module.exports = CouponController;
