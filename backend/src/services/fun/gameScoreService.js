const ApiError = require('../../utils/apiError');
const eventBus = require('../../utils/eventBus');

class GameScoreService {
  constructor(gameScoreRepository) {
    this.gameScoreRepository = gameScoreRepository;
  }

  // Regras de limites de pontos por tipo de jogo
  static MAX_ALLOWED_POINTS = {
    memory: 100,
    quiz: 50,
    likely: 20,
    scratch_card: 30,
    custom: 50
  };

  async recordScore(coupleId, username, gameType, points, metadata = {}) {
    if (!coupleId || !username || !gameType) {
      throw new ApiError(400, 'Parâmetros obrigatórios em falta para registo de pontos.');
    }

    if (points <= 0) {
      throw new ApiError(400, 'A pontuação deve ser maior que 0.');
    }

    const record = await this.gameScoreRepository.create({
      coupleId,
      username,
      gameType,
      points,
      metadata
    });

    try {
      eventBus.emit('socket:emit-update', {
        room: coupleId,
        type: 'score-updated',
        user: username,
        value: points
      });
    } catch (e) { /* ignore */ }

    return record;
  }

  async submitClientScore(coupleId, username, gameType, points, metadata = {}) {
    if (gameType === 'tic-tac-toe' || !GameScoreService.MAX_ALLOWED_POINTS[gameType]) {
      throw new ApiError(400, `O jogo '${gameType}' não permite submissão direta de pontos pelo cliente.`);
    }

    const maxAllowed = GameScoreService.MAX_ALLOWED_POINTS[gameType];
    if (points > maxAllowed) {
      throw new ApiError(400, `A pontuação de ${points} excede o limite máximo permitido (${maxAllowed}) para ${gameType}.`);
    }

    return this.recordScore(coupleId, username, gameType, points, metadata);
  }

  async getSummary(coupleId, period = 'all') {
    if (!coupleId) {
      throw new ApiError(400, 'Identificador do casal em falta.');
    }

    const validPeriod = period === 'month' ? 'month' : 'all';
    return this.gameScoreRepository.getScoreSummary(coupleId, validPeriod);
  }

  async resetScores(coupleId, username = 'system') {
    if (!coupleId) {
      throw new ApiError(400, 'Identificador do casal em falta.');
    }

    await this.gameScoreRepository.deleteCoupleScores(coupleId);

    try {
      eventBus.emit('socket:emit-update', {
        room: coupleId,
        type: 'scores-reset',
        user: username,
        value: '0'
      });
    } catch (e) { /* ignore */ }

    return { message: 'Pontuações do casal reiniciadas com sucesso!' };
  }
}

module.exports = GameScoreService;
