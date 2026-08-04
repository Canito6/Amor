const User = require('../../models/auth/userModel');
const ApiError = require('../../utils/apiError');

class OpenWhenService {
  constructor(openWhenRepository) {
    this.openWhenRepository = openWhenRepository;
  }

  async getLetters(coupleId, username) {
    const letters = await this.openWhenRepository.find({ coupleId }, { createdAt: -1 });

    return letters.map(letter => {
      const isCreator = letter.createdBy === username;
      if (!isCreator && !letter.isOpened) {
        const letterObj = letter.toObject ? letter.toObject() : { ...letter };
        letterObj.content = ''; // Ocultar o texto para evitar trapaças no inspecionar elemento
        return letterObj;
      }
      return letter;
    });
  }

  async openLetter(id, username, userId, coupleId) {
    const letter = await this.openWhenRepository.findById(id);
    if (!letter) {
      throw new ApiError(404, 'Carta não encontrada.');
    }

    if (letter.coupleId !== coupleId) {
      throw new ApiError(403, 'Não tens permissão para aceder a esta carta.');
    }

    if (letter.isOpened) {
      return letter;
    }

    const isCreator = letter.createdBy === username;
    if (isCreator) {
      throw new ApiError(400, 'Não podes abrir a tua própria carta surpresa. Deixa o teu parceiro abri-la!');
    }

    // Validar condições
    if (letter.conditionType === 'date') {
      const now = new Date();
      const targetDate = new Date(letter.conditionValue);
      if (now < targetDate) {
        throw new ApiError(400, 'Ainda não chegou o dia correto para abrir esta carta!');
      }
    } else if (letter.conditionType === 'mood') {
      const user = await User.findById(userId);
      if (!user || user.moodEmoji !== letter.conditionValue) {
        throw new ApiError(400, 'O teu humor atual não coincide com o humor exigido por esta carta!');
      }
    }

    letter.isOpened = true;
    letter.openedAt = new Date();
    await letter.save();

    return letter;
  }
}

module.exports = OpenWhenService;
