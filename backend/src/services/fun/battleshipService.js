const ApiError = require('../../utils/apiError');
const eventBus = require('../../utils/eventBus');
const geminiService = require('../ai/geminiService');

class BattleshipService {
  constructor(gameSessionRepository) {
    this.gameSessionRepository = gameSessionRepository;
  }

  static GRID_SIZE = 6; // 6x6 = 36 posições

  async getOrCreateSession(coupleId) {
    let session = await this.gameSessionRepository.findByCoupleAndGame(coupleId, 'battleship');
    if (!session) {
      session = await this.gameSessionRepository.create({
        coupleId,
        gameType: 'battleship',
        players: [],
        state: {
          level: 'medium', // 'easy' | 'medium' | 'hard' (🔥🔞)
          mode: 'ai',      // 'ai' | 'manual'
          status: 'setup', // 'setup' | 'playing' | 'finished'
          ready: {},      // { [username]: boolean }
          boards: {},     // { [username]: array of 36 cells with shipId or null }
          ships: {},      // { [username]: { shipId: { name, size, hits, sunk, indices } } }
          attacks: {},    // { [attackerUsername]: { [targetIndex]: 'water'|'hit'|'sunk' } }
          currentTurn: null,
          activeChallenge: null,
          winner: null,
          scores: {}
        }
      });
    }
    return this._ensureStateDefaults(session);
  }

  _ensureStateDefaults(session) {
    if (!session) return session;
    if (!session.state || typeof session.state !== 'object') session.state = {};
    if (!session.state.level) session.state.level = 'medium';
    if (!session.state.mode) session.state.mode = 'ai';
    if (!session.state.status) session.state.status = 'setup';
    if (!session.state.ready || typeof session.state.ready !== 'object') session.state.ready = {};
    if (!session.state.boards || typeof session.state.boards !== 'object') session.state.boards = {};
    if (!session.state.ships || typeof session.state.ships !== 'object') session.state.ships = {};
    if (!session.state.attacks || typeof session.state.attacks !== 'object') session.state.attacks = {};
    if (!session.state.scores || typeof session.state.scores !== 'object') session.state.scores = {};
    if (session.state.currentTurn === undefined) session.state.currentTurn = null;
    if (session.state.activeChallenge === undefined) session.state.activeChallenge = null;
    if (session.state.winner === undefined) session.state.winner = null;
    return session;
  }

  async joinSession(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);
    let player = session.players.find(p => p.username === username);

    if (!player) {
      if (session.players.length >= 2) {
        throw new ApiError(400, 'A sessão de Batalha Naval já tem 2 jogadores.');
      }
      const symbol = session.players.length === 0 ? 'X' : 'O';
      session.players.push({ username, symbol });

      if (!session.state.boards[username]) {
        session.state.boards[username] = Array(36).fill(null);
      }
      if (!session.state.attacks[username]) {
        session.state.attacks[username] = {};
      }
      if (!session.state.scores[username]) {
        session.state.scores[username] = 0;
      }
      if (session.state.ready[username] === undefined) {
        session.state.ready[username] = false;
      }

      if (!session.state.currentTurn) {
        session.state.currentTurn = username;
      }

      if (typeof session.markModified === 'function') session.markModified('state');
      await session.save();
    }

    this._broadcastState(coupleId, session);
    return session;
  }

  async placeShips(coupleId, username, shipPlacements) {
    // shipPlacements: [ { id: 'heart', indices: [0, 1, 2] }, { id: 'boat', indices: [10, 11] }, { id: 'island', indices: [25] } ]
    const session = await this.getOrCreateSession(coupleId);

    if (!Array.isArray(shipPlacements) || shipPlacements.length !== 3) {
      throw new ApiError(400, 'Deves posicionar exatamente 3 navios: Coração (3), Barco (2) e Ilha (1).');
    }

    const board = Array(36).fill(null);
    const shipState = {};
    const usedIndices = new Set();

    for (const ship of shipPlacements) {
      if (!ship.id || !Array.isArray(ship.indices)) {
        throw new ApiError(400, 'Formato de navios inválido.');
      }

      for (const idx of ship.indices) {
        if (idx < 0 || idx >= 36 || usedIndices.has(idx)) {
          throw new ApiError(400, 'Posições de navios inválidas ou sobrepostas.');
        }
        usedIndices.add(idx);
        board[idx] = ship.id;
      }

      let name = 'Navio';
      if (ship.id === 'heart') name = '💘 Coração de Ouro';
      if (ship.id === 'boat') name = '🛥️ Barco do Amor';
      if (ship.id === 'island') name = '🏝️ Ilha Secreta';

      shipState[ship.id] = {
        id: ship.id,
        name,
        size: ship.indices.length,
        hits: 0,
        sunk: false,
        indices: ship.indices
      };
    }

    session.state.boards[username] = board;
    session.state.ships[username] = shipState;
    session.state.ready[username] = true;

    // Verificar se ambos os jogadores estão prontos
    const players = session.players.map(p => p.username);
    if (players.length === 2 && session.state.ready[players[0]] && session.state.ready[players[1]]) {
      session.state.status = 'playing';
    }

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async attack(coupleId, attackerUsername, targetIndex) {
    const session = await this.getOrCreateSession(coupleId);

    if (session.state.status !== 'playing') {
      throw new ApiError(400, 'A partida ainda não começou ou já terminou.');
    }

    if (session.state.currentTurn !== attackerUsername) {
      throw new ApiError(400, 'Não é o teu turno de atacar!');
    }

    const defender = session.players.find(p => p.username !== attackerUsername);
    if (!defender) {
      throw new ApiError(400, 'Aguarde pela entrada do teu parceiro.');
    }
    const defenderUsername = defender.username;

    const defenderBoard = session.state.boards[defenderUsername] || Array(36).fill(null);
    const defenderShips = session.state.ships[defenderUsername] || {};
    const attackerAttacks = session.state.attacks[attackerUsername] || {};

    if (targetIndex < 0 || targetIndex >= 36) {
      throw new ApiError(400, 'Posição de ataque fora da grelha.');
    }

    if (attackerAttacks[targetIndex]) {
      throw new ApiError(400, 'Já atacaste esta posição anteriormente!');
    }

    const hitShipId = defenderBoard[targetIndex];
    let result = 'water';
    let challenge = null;

    if (!hitShipId) {
      attackerAttacks[targetIndex] = 'water';
      // Errou: passa o turno
      session.state.currentTurn = defenderUsername;
    } else {
      attackerAttacks[targetIndex] = 'hit';
      const ship = defenderShips[hitShipId];
      if (ship) {
        ship.hits += 1;
        if (ship.hits >= ship.size) {
          ship.sunk = true;
          result = 'sunk';
          // Marcar todos os índices do navio afundado
          ship.indices.forEach(idx => {
            attackerAttacks[idx] = 'sunk';
          });

          // Gerar Desafio IA / Recompensa ao afundar o navio!
          const coupleNames = session.players.map(p => p.username);
          const generated = await geminiService.generateTruthOrDare({
            level: session.state.level || 'medium',
            type: 'dare',
            coupleNames
          });

          challenge = {
            shipName: ship.name,
            sunkBy: attackerUsername,
            victim: defenderUsername,
            challengeText: generated.content,
            aiGenerated: generated.aiGenerated
          };
          session.state.activeChallenge = challenge;
        }
      }

      // Se acertou, mantém o turno de ataque!
    }

    session.state.attacks[attackerUsername] = attackerAttacks;

    // Verificar se todos os navios do defensor foram afundados (Vitória!)
    const allSunk = Object.values(defenderShips).length > 0 && Object.values(defenderShips).every(s => s.sunk);
    if (allSunk) {
      session.state.status = 'finished';
      session.state.winner = attackerUsername;
      session.state.scores[attackerUsername] = (session.state.scores[attackerUsername] || 0) + 50;
    }

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async dismissChallenge(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);
    session.state.activeChallenge = null;
    if (typeof session.markModified === 'function') session.markModified('state');
    await session.save();
    this._broadcastState(coupleId, session);
    return session;
  }

  async updateSettings(coupleId, username, { level, mode }) {
    const session = await this.getOrCreateSession(coupleId);
    if (level && ['easy', 'medium', 'hard'].includes(level)) session.state.level = level;
    if (mode && ['ai', 'manual'].includes(mode)) session.state.mode = mode;
    if (typeof session.markModified === 'function') session.markModified('state');
    await session.save();
    this._broadcastState(coupleId, session);
    return session;
  }

  async resetGame(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);

    session.state.status = 'setup';
    session.state.ready = {};
    session.state.boards = {};
    session.state.ships = {};
    session.state.attacks = {};
    session.state.activeChallenge = null;
    session.state.winner = null;

    session.players.forEach(p => {
      session.state.ready[p.username] = false;
      session.state.boards[p.username] = Array(36).fill(null);
      session.state.attacks[p.username] = {};
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
        event: 'battleship-update',
        data: session.toObject ? session.toObject() : session
      });
    } catch (err) {
      console.error('Erro ao emitir evento de WebSocket para battleship:', err);
    }
  }
}

module.exports = BattleshipService;
