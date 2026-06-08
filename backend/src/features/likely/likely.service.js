const ApiError = require('../../utils/apiError');

class LikelyService {
  constructor(likelyRepository) {
    this.likelyRepository = likelyRepository;
  }

  async voteQuestion(id, voter, votedFor, coupleId) {
    const question = await this.likelyRepository.findById(id);
    if (!question) {
      throw new ApiError(404, 'Pergunta não encontrada.');
    }

    if (question.coupleId !== coupleId) {
      throw new ApiError(403, 'Não tens permissão para aceder a esta pergunta.');
    }

    // Verificar se já votou nesta pergunta
    const alreadyVoted = question.votes.some(v => v.voter === voter);
    if (alreadyVoted) {
      throw new ApiError(400, 'Já registaste o teu voto para esta pergunta!');
    }

    // Adicionar voto
    question.votes.push({
      voter: voter,
      votedFor: votedFor.trim()
    });

    // Se ambos votaram (2 votos), calcular match
    if (question.votes.length === 2) {
      const vote1 = question.votes[0].votedFor;
      const vote2 = question.votes[1].votedFor;
      question.isMatched = (vote1.toLowerCase() === vote2.toLowerCase());
    }

    await question.save();
    return question;
  }
}

module.exports = LikelyService;
