const ApiError = require('../../utils/apiError');

class JarService {
  constructor(jarRepository) {
    this.jarRepository = jarRepository;
  }

  async getRandomJarNote(coupleId, username) {
    // Tenta obter um papelinho escrito pelo PARCEIRO (createdBy !== username)
    let count = await this.jarRepository.countDocuments({
      coupleId,
      createdBy: { $ne: username }
    });

    let notes;
    if (count > 0) {
      const randomOffset = Math.floor(Math.random() * count);
      notes = await this.jarRepository.model.find({
        coupleId,
        createdBy: { $ne: username }
      }).skip(randomOffset).limit(1);
    } else {
      // Se o parceiro ainda não escreveu nada, tenta obter qualquer papelinho do casal
      count = await this.jarRepository.countDocuments({ coupleId });
      if (count === 0) {
        throw new ApiError(404, 'O frasco está vazio! Escrevam algumas mensagens primeiro.');
      }
      const randomOffset = Math.floor(Math.random() * count);
      notes = await this.jarRepository.model.find({ coupleId }).skip(randomOffset).limit(1);
    }

    return notes[0];
  }
}

module.exports = JarService;
