const ApiError = require('../../utils/apiError');

class LikelyService {
  constructor(likelyRepository) {
    this.likelyRepository = likelyRepository;
  }

  async voteQuestion(id, voter, votedFor, coupleId) {
    // [SEGURANÇA - VULN-008] Usar findOneAndUpdate atómico para garantir que o voto é inserido no array apenas se o voter não existir lá (prevenir race condition)
    const updatedQuestion = await this.likelyRepository.model.findOneAndUpdate(
      {
        _id: id,
        coupleId: coupleId,
        'votes.voter': { $ne: voter } // Garante que o voter não está no array de votos
      },
      {
        $push: {
          votes: {
            voter: voter,
            votedFor: votedFor.trim()
          }
        }
      },
      { new: true }
    );

    if (!updatedQuestion) {
      // Se não atualizou, ou a pergunta não existe ou o utilizador já votou
      const exists = await this.likelyRepository.findById(id);
      if (!exists) {
        throw new ApiError(404, 'Pergunta não encontrada.');
      }
      if (exists.coupleId !== coupleId) {
        throw new ApiError(403, 'Não tens permissão para aceder a esta pergunta.');
      }
      throw new ApiError(400, 'Já registaste o teu voto para esta pergunta!');
    }

    // Se o voto foi adicionado com sucesso, agora podemos verificar se ambos votaram
    if (updatedQuestion.votes.length === 2) {
      const vote1 = updatedQuestion.votes[0].votedFor;
      const vote2 = updatedQuestion.votes[1].votedFor;
      updatedQuestion.isMatched = (vote1.toLowerCase() === vote2.toLowerCase());
      await updatedQuestion.save();
    }

    return updatedQuestion;
  }
}

module.exports = LikelyService;
