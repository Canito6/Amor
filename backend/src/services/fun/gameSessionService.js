const ApiError = require('../../utils/apiError');
const eventBus = require('../../utils/eventBus');
const GameScoreRepository = require('../../repositories/fun/gameScoreRepository');
const GameScoreService = require('./gameScoreService');

class GameSessionService {
  constructor(gameSessionRepository, gameScoreService = null) {
    this.gameSessionRepository = gameSessionRepository;
    this.gameScoreService = gameScoreService || new GameScoreService(new GameScoreRepository());
  }

  // Linhas de vitória para grelha 3x3 do Jogo do Galo
  static WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
  ];

  static checkWinner(board) {
    for (const combo of GameSessionService.WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], winningLine: combo };
      }
    }

    if (board.every(cell => cell !== null)) {
      return { winner: 'draw', winningLine: null };
    }

    return null;
  }

  async getOrCreateSession(coupleId, gameType = 'tic-tac-toe') {
    let session = await this.gameSessionRepository.findByCoupleAndGame(coupleId, gameType);
    if (!session) {
      session = await this.gameSessionRepository.create({
        coupleId,
        gameType,
        players: [],
        state: {
          board: Array(9).fill(null),
          currentTurn: 'X',
          status: 'waiting',
          winner: null,
          winningLine: null,
          scores: { X: 0, O: 0, draws: 0 },
          lastStarter: 'X'
        }
      });
    }
    return session;
  }

  async joinSession(coupleId, username, gameType = 'tic-tac-toe') {
    const session = await this.getOrCreateSession(coupleId, gameType);

    let player = session.players.find(p => p.username === username);

    if (!player) {
      if (session.players.length >= 2) {
        // Se o jogo já tiver 2 jogadores de outro nome, reatribuir se for um dos parceiros
        throw new ApiError(400, 'A sessão de jogo já tem 2 jogadores registados.');
      }

      const assignedSymbol = session.players.length === 0 ? 'X' : 'O';
      session.players.push({ username, symbol: assignedSymbol });
      player = { username, symbol: assignedSymbol };

      if (session.players.length === 2) {
        session.state.status = session.state.status === 'finished' ? 'finished' : 'playing';
      }

      await session.save();
    }

    // Transmitir atualização de estado via Socket.io ao casal
    this._broadcastState(coupleId, session);

    return session;
  }

  async makeMove(coupleId, username, index, gameType = 'tic-tac-toe') {
    const session = await this.getOrCreateSession(coupleId, gameType);

    if (session.state.status !== 'playing') {
      throw new ApiError(400, 'O jogo não está em curso. Aguarde pelo parceiro ou inicie uma nova partida.');
    }

    const player = session.players.find(p => p.username === username);
    if (!player) {
      throw new ApiError(403, 'Apenas jogadores registados na sessão podem fazer jogadas.');
    }

    if (player.symbol !== session.state.currentTurn) {
      throw new ApiError(400, 'Não é o teu turno de jogar!');
    }

    if (index < 0 || index > 8 || session.state.board[index] !== null) {
      throw new ApiError(400, 'Célula inválida ou já ocupada.');
    }

    // Aplicar a jogada
    session.state.board[index] = player.symbol;

    // Verificar se a jogada resultou em vitória ou empate
    const result = GameSessionService.checkWinner(session.state.board);

    if (result) {
      session.state.status = 'finished';
      session.state.winner = result.winner;
      session.state.winningLine = result.winningLine;

      if (result.winner === 'draw') {
        session.state.scores.draws += 1;
        // Atribuir 20 pontos de empate a cada um dos jogadores
        for (const p of session.players) {
          try {
            await this.gameScoreService.recordScore(coupleId, p.username, 'tic-tac-toe', 20, { result: 'draw' });
          } catch (err) {
            // Ignorar erro se falhar registo de pontos individual
          }
        }
      } else {
        const winningSymbol = result.winner;
        if (winningSymbol === 'X') session.state.scores.X += 1;
        if (winningSymbol === 'O') session.state.scores.O += 1;

        const winnerPlayer = session.players.find(p => p.symbol === winningSymbol);
        const loserPlayer = session.players.find(p => p.symbol !== winningSymbol);

        if (winnerPlayer) {
          try {
            await this.gameScoreService.recordScore(coupleId, winnerPlayer.username, 'tic-tac-toe', 50, { result: 'win' });
          } catch (err) { /* ignore */ }
        }
        if (loserPlayer) {
          try {
            await this.gameScoreService.recordScore(coupleId, loserPlayer.username, 'tic-tac-toe', 10, { result: 'loss_consolation' });
          } catch (err) { /* ignore */ }
        }
      }
    } else {
      // Alternar turno
      session.state.currentTurn = session.state.currentTurn === 'X' ? 'O' : 'X';
    }

    session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);

    return session;
  }

  async resetSession(coupleId, username, gameType = 'tic-tac-toe') {
    const session = await this.getOrCreateSession(coupleId, gameType);

    // O jogador que perdeu começa a partida seguinte (ou alterna quem começa se empate)
    let nextStarter = session.state.lastStarter === 'X' ? 'O' : 'X';
    if (session.state.winner && session.state.winner !== 'draw') {
      // Quem perdeu começa
      nextStarter = session.state.winner === 'X' ? 'O' : 'X';
    }

    session.state.board = Array(9).fill(null);
    session.state.currentTurn = nextStarter;
    session.state.lastStarter = nextStarter;
    session.state.winner = null;
    session.state.winningLine = null;
    session.state.status = session.players.length === 2 ? 'playing' : 'waiting';

    session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);

    return session;
  }

  _broadcastState(coupleId, session) {
    try {
      eventBus.emit('socket:emit', {
        room: coupleId,
        event: 'tic-tac-toe-update',
        data: session.toObject ? session.toObject() : session
      });
    } catch (err) {
      console.error('Erro ao emitir evento tic-tac-toe-update:', err);
    }
  }
}

module.exports = GameSessionService;
