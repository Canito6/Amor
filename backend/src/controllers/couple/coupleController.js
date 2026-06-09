const User = require('../../models/auth/userModel');
const Couple = require('../../models/couple/coupleModel');
const ApiError = require('../../utils/apiError');
const storageService = require('../../services/common/storageService');
const eventBus = require('../../utils/eventBus');

const Quiz = require('../../models/fun/quizModel');
const ScratchCard = require('../../models/fun/scratchCardModel');
const BucketItem = require('../../models/fun/bucketItemModel');
const Memory = require('../../models/fun/memoryModel');
const Photo = require('../../models/gallery/photoModel');
const Coupon = require('../../models/fun/couponModel');
const LikelyQuestion = require('../../models/fun/likelyModel');


exports.getCoupleInfo = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;
    let couple = await Couple.findById(coupleId);
    
    // Find all users belonging to this couple
    const users = await User.find({ coupleId });
    const partnerNames = users.map(u => u.username);

    if (!couple && coupleId !== 'default_couple') {
      // Create Couple document if it was missing
      couple = new Couple({
        _id: coupleId,
        partner1: users[0]?._id,
        partner2: users[1]?._id
      });
      await couple.save();
    }

    res.json({
      coupleId,
      names: couple?.names || '',
      relationshipDate: couple?.relationshipDate || null,
      spotifyPlaylist: couple?.spotifyPlaylist || 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5YxZ2718Eld?utm_source=generator&theme=0',
      partnerNames,
      partners: users.map(u => ({
        username: u.username,
        moodEmoji: u.moodEmoji || '',
        moodUpdatedAt: u.moodUpdatedAt || null,
        avatarUrl: u.avatarUrl || ''
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupleInfo = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;
    const { names, relationshipDate, spotifyPlaylist } = req.body;

    let couple = await Couple.findById(coupleId);
    if (!couple) {
      if (coupleId === 'default_couple') {
        throw new ApiError(400, 'Não é possível editar a conta de casal predefinida. Por favor, conecte a sua namorada primeiro.');
      }
      couple = new Couple({ _id: coupleId, partner1: req.user.id });
    }

    if (names !== undefined) couple.names = names;
    if (relationshipDate !== undefined) couple.relationshipDate = relationshipDate ? new Date(relationshipDate) : null;
    if (spotifyPlaylist !== undefined) couple.spotifyPlaylist = spotifyPlaylist;

    await couple.save();

    const users = await User.find({ coupleId });
    const partnerNames = users.map(u => u.username);

    res.json({
      coupleId,
      names: couple.names,
      relationshipDate: couple.relationshipDate,
      spotifyPlaylist: couple.spotifyPlaylist,
      partnerNames
    });
  } catch (error) {
    next(error);
  }
};

exports.linkCouple = async (req, res, next) => {
  try {
    const { inviteToken } = req.body;
    if (!inviteToken || inviteToken.trim() === '') {
      throw new ApiError(400, 'O token de convite é obrigatório.');
    }

    // Try to find a user that has this coupleId or whose username/email is inviteToken
    let targetUser = await User.findOne({
      $or: [
        { coupleId: inviteToken.trim() },
        { username: inviteToken.trim() },
        { email: inviteToken.trim() }
      ]
    });

    if (!targetUser) {
      throw new ApiError(404, 'Nenhum parceiro encontrado com o código/nome fornecido.');
    }

    if (targetUser._id.toString() === req.user.id.toString()) {
      throw new ApiError(400, 'Não te podes conectar a ti próprio!');
    }

    let targetCoupleId = targetUser.coupleId;

    if (targetCoupleId === 'default_couple') {
      // Create a new Couple document and link both
      const newCouple = new Couple({
        partner1: targetUser._id,
        partner2: req.user.id
      });
      await newCouple.save();
      targetCoupleId = newCouple._id;
      
      // Update partner
      targetUser.coupleId = targetCoupleId;
      await targetUser.save();
    } else {
      // Just update the Couple record to set us as partner2 if not set
      const couple = await Couple.findById(targetCoupleId);
      if (couple) {
        if (!couple.partner2) {
          couple.partner2 = req.user.id;
          await couple.save();
        } else if (couple.partner1.toString() !== req.user.id.toString() && couple.partner2.toString() !== req.user.id.toString()) {
          // Both slots filled, but maybe we can overwrite or throw error
          // Let's set us as partner2
          couple.partner2 = req.user.id;
          await couple.save();
        }
      } else {
        const newCouple = new Couple({
          _id: targetCoupleId,
          partner1: targetUser._id,
          partner2: req.user.id
        });
        await newCouple.save();
      }
    }

    // Update current user's coupleId
    const currentUser = await User.findById(req.user.id);
    currentUser.coupleId = targetCoupleId;
    await currentUser.save();

    res.json({
      message: 'Casal conectado com sucesso! ❤️',
      coupleId: targetCoupleId
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMood = async (req, res, next) => {
  try {
    const { moodEmoji } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado.');
    }

    user.moodEmoji = moodEmoji !== undefined ? moodEmoji.trim() : '';
    user.moodUpdatedAt = new Date();
    await user.save();

    eventBus.emit('socket:emit-update', {
      room: req.coupleId,
      type: 'mood',
      user: req.user.username,
      value: user.moodEmoji
    });

    res.json({
      message: 'Humor atualizado com sucesso!',
      moodEmoji: user.moodEmoji,
      moodUpdatedAt: user.moodUpdatedAt
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Por favor, seleciona um ficheiro de imagem.');
    }

    const resultado = await storageService.uploadFile(req.file.buffer, 'o-nosso-cantinho-perfis');

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado.');
    }

    // Se o user já tinha avatar, tentar apagar do Cloudinary para poupar espaço
    if (user.avatarUrl) {
      await storageService.deleteFile(user.avatarUrl);
    }

    user.avatarUrl = resultado.secure_url;
    await user.save();

    res.json({
      message: 'Avatar atualizado com sucesso!',
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    next(error);
  }
};

exports.getCoupleStats = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;

    const [
      quizzesTotal,
      quizzesCompleted,
      scratchTotal,
      scratchScratched,
      bucketTotal,
      bucketCompleted,
      memoriesTotal,
      photosTotal,
      couponsRedeemed,
      likelyQuestions
    ] = await Promise.all([
      Quiz.countDocuments({ coupleId }),
      Quiz.countDocuments({ coupleId, completed: true }),
      ScratchCard.countDocuments({ coupleId }),
      ScratchCard.countDocuments({ coupleId, isScratched: true }),
      BucketItem.countDocuments({ coupleId }),
      BucketItem.countDocuments({ coupleId, completed: true }),
      Memory.countDocuments({ coupleId }),
      Photo.countDocuments({ coupleId }),
      Coupon.countDocuments({ coupleId, status: 'redeemed' }),
      LikelyQuestion.find({ coupleId })
    ]);

    // Calcular sintonia do Likely
    const completedLikely = likelyQuestions.filter(q => q.votes.length === 2);
    const matchedLikely = completedLikely.filter(q => q.isMatched).length;

    res.json({
      quizzes: {
        total: quizzesTotal,
        completed: quizzesCompleted
      },
      scratchCards: {
        total: scratchTotal,
        scratched: scratchScratched
      },
      bucketList: {
        total: bucketTotal,
        completed: bucketCompleted
      },
      memoriesCount: memoriesTotal,
      photosCount: photosTotal,
      couponsCount: couponsRedeemed,
      likely: {
        total: completedLikely.length,
        matched: matchedLikely
      }
    });
  } catch (error) {
    next(error);
  }
};

