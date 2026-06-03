const Coupon = require('../models/Coupon');

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ coupleId: req.coupleId })
      .sort({ status: 1, createdAt: -1 }); // 'gifted' primeiro, depois mais recentes
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter os vales.' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'O título do vale é obrigatório.' });
    }

    const newCoupon = new Coupon({
      title: title.trim(),
      description: description ? description.trim() : '',
      icon: icon || '🎟️',
      coupleId: req.coupleId,
      createdBy: req.user.username
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o vale.' });
  }
};

exports.redeemCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: 'Vale não encontrado.' });
    }

    if (coupon.coupleId !== req.coupleId) {
      return res.status(403).json({ error: 'Não tens permissão para resgatar este vale.' });
    }

    if (coupon.status === 'redeemed') {
      return res.status(400).json({ error: 'Este vale já foi utilizado!' });
    }

    coupon.status = 'redeemed';
    coupon.redeemedAt = new Date();

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao resgatar o vale.' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: 'Vale não encontrado.' });
    }

    if (coupon.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para eliminar este vale.' });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vale eliminado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar o vale.' });
  }
};
