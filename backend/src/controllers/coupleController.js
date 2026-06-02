const User = require('../models/User');
const Couple = require('../models/Couple');
const ApiError = require('../utils/apiError');

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
        moodUpdatedAt: u.moodUpdatedAt || null
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

    res.json({
      message: 'Humor atualizado com sucesso!',
      moodEmoji: user.moodEmoji,
      moodUpdatedAt: user.moodUpdatedAt
    });
  } catch (error) {
    next(error);
  }
};

