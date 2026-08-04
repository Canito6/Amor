const ApiError = require('../../utils/apiError');
const eventBus = require('../../utils/eventBus');
const geminiService = require('../ai/geminiService');

class TruthOrDareService {
  constructor(gameSessionRepository) {
    this.gameSessionRepository = gameSessionRepository;
  }

  async getOrCreateSession(coupleId) {
    let session = await this.gameSessionRepository.findByCoupleAndGame(coupleId, 'truth-or-dare');
    if (!session) {
      session = await this.gameSessionRepository.create({
        coupleId,
        gameType: 'truth-or-dare',
        players: [],
        state: {
          level: 'medium', // 'easy' | 'medium' | 'hard' (🔥🔞)
          mode: 'ai',      // 'ai' | 'manual'
          truthsCount: {}, // { [username]: number }
          activeCard: null,
          scores: {},      // { [username]: number }
          history: []
        }
      });
    }
    return session;
  }

  async joinSession(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);
    let player = session.players.find(p => p.username === username);

    if (!player) {
      if (session.players.length >= 2) {
        throw new ApiError(400, 'A sessão já tem 2 jogadores registados.');
      }
      const symbol = session.players.length === 0 ? 'X' : 'O';
      session.players.push({ username, symbol });

      if (session.state.truthsCount[username] === undefined) {
        session.state.truthsCount[username] = 0;
      }
      if (session.state.scores[username] === undefined) {
        session.state.scores[username] = 0;
      }
      if (typeof session.markModified === 'function') session.markModified('state');
      await session.save();
    }

    this._broadcastState(coupleId, session);
    return session;
  }

  async drawCard(coupleId, username, { type, customText }) {
    const session = await this.getOrCreateSession(coupleId);
    const truthsUsed = session.state.truthsCount[username] || 0;

    // REGRA DAS 3 VERDADES: Bloquear se o jogador tentar 'truth' após usar 3 verdades
    if (type === 'truth' && truthsUsed >= 3) {
      throw new ApiError(400, 'Esgotaste as tuas 3 Verdades por jogo! És obrigado(a) a escolher Consequência 🔥');
    }

    // Se for 'truth', incrementar o contador de verdades usadas pelo jogador
    if (type === 'truth') {
      session.state.truthsCount[username] = truthsUsed + 1;
    }

    const partnerPlayer = session.players.find(p => p.username !== username);
    const targetUser = partnerPlayer ? partnerPlayer.username : 'Parceiro(a)';

    const coupleNames = session.players.map(p => p.username);
    if (coupleNames.length < 2) coupleNames.push('Parceiro(a)');

    let cardContent = '';
    let isAi = false;

    if (session.state.mode === 'manual' && customText && customText.trim()) {
      cardContent = customText.trim();
      isAi = false;
    } else {
      const generated = await geminiService.generateTruthOrDare({
        level: session.state.level || 'medium',
        type,
        coupleNames
      });
      cardContent = generated.content;
      isAi = generated.aiGenerated;
    }

    const card = {
      id: Date.now().toString(),
      type,
      content: cardContent,
      level: session.state.level || 'medium',
      mode: session.state.mode || 'ai',
      drawnBy: username,
      targetUser,
      status: 'pending',
      penaltyContent: null,
      aiGenerated: isAi
    };

    session.state.activeCard = card;
    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async completeCard(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);
    if (!session.state.activeCard || session.state.activeCard.status === 'completed') {
      throw new ApiError(400, 'Não há nenhuma carta pendente para concluir.');
    }

    session.state.activeCard.status = 'completed';
    session.state.scores[username] = (session.state.scores[username] || 0) + 10;

    if (!Array.isArray(session.state.history)) {
      session.state.history = [];
    }
    session.state.history.unshift(session.state.activeCard);
    if (session.state.history.length > 20) {
      session.state.history = session.state.history.slice(0, 20);
    }

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async refuseCard(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);
    if (!session.state.activeCard || session.state.activeCard.status !== 'pending') {
      throw new ApiError(400, 'Não podes recusar uma carta que não esteja pendente.');
    }

    // Gerar Consequência Obrigatória de Penalização
    const penalty = await geminiService.generatePenaltyConsequence({
      level: session.state.level || 'medium'
    });

    session.state.activeCard.status = 'penalty';
    session.state.activeCard.penaltyContent = penalty.content;

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async completePenalty(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);
    if (!session.state.activeCard || session.state.activeCard.status !== 'penalty') {
      throw new ApiError(400, 'Não há nenhuma penalização pendente.');
    }

    session.state.activeCard.status = 'completed';

    if (!Array.isArray(session.state.history)) {
      session.state.history = [];
    }
    session.state.history.unshift(session.state.activeCard);
    if (session.state.history.length > 20) {
      session.state.history = session.state.history.slice(0, 20);
    }

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async updateSettings(coupleId, username, { level, mode } = {}) {
    const session = await this.getOrCreateSession(coupleId);
    if (!session.state) {
      session.state = {
        level: 'medium',
        mode: 'ai',
        truthsCount: {},
        activeCard: null,
        scores: {},
        history: []
      };
    }

    if (level && ['easy', 'medium', 'hard'].includes(level)) {
      session.state.level = level;
    }

    if (mode && ['ai', 'manual'].includes(mode)) {
      session.state.mode = mode;
    }

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async resetGame(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);

    session.state.activeCard = null;
    session.state.truthsCount = {};
    session.players.forEach(p => {
      session.state.truthsCount[p.username] = 0;
    });

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  _broadcastState(coupleId, session) {
    try {
      eventBus.emit('socket:emit', {
        room: coupleId.toString(),
        event: 'truth-or-dare-update',
        data: session.toObject ? session.toObject() : session
      });
    } catch (err) {
      console.error('Erro ao emitir evento de WebSocket para truth-or-dare:', err);
    }
  }
}

module.exports = TruthOrDareService;
