const User = require('../../models/auth/userModel');
const ApiError = require('../../utils/apiError');
const storageService = require('../../services/common/storageService');
const eventBus = require('../../utils/eventBus');

exports.updateMood = async (req, res, next) => {
  try {
    const { moodEmoji } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado.');
    }

    user.moodEmoji = moodEmoji !== undefined ? moodEmoji.trim() : '';
    user.moodUpdatedAt = new Date();
    
    // Registar no histórico
    if (!user.moodHistory) {
      user.moodHistory = [];
    }
    user.moodHistory.push({ emoji: user.moodEmoji, updatedAt: user.moodUpdatedAt });
    // Limitar o histórico aos últimos 30 registos
    if (user.moodHistory.length > 30) {
      user.moodHistory.shift();
    }
    
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
