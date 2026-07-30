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

  static checkWinner(board, gameType = 'tic-tac-toe') {
    if (gameType === 'connect-four') {
      return GameSessionService.checkConnectFourWinner(board);
    }

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

  // Deteção de 4 em linha (7 colunas x 6 linhas = 42 posições)
  static checkConnectFourWinner(board) {
    const ROWS = 6;
    const COLS = 7;

    const getCell = (r, c) => board[r * COLS + c];
    const getIndex = (r, c) => r * COLS + c;

    // 1. Horizontal (↔️)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = getCell(r, c);
        if (val && val === getCell(r, c + 1) && val === getCell(r, c + 2) && val === getCell(r, c + 3)) {
          return {
            winner: val,
            winningLine: [getIndex(r, c), getIndex(r, c + 1), getIndex(r, c + 2), getIndex(r, c + 3)]
          };
        }
      }
    }

    // 2. Vertical (↕️)
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = getCell(r, c);
        if (val && val === getCell(r + 1, c) && val === getCell(r + 2, c) && val === getCell(r + 3, c)) {
          return {
            winner: val,
            winningLine: [getIndex(r, c), getIndex(r + 1, c), getIndex(r + 2, c), getIndex(r + 3, c)]
          };
        }
      }
    }

    // 3. Diagonal Descendente ↘️
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = getCell(r, c);
        if (val && val === getCell(r + 1, c + 1) && val === getCell(r + 2, c + 2) && val === getCell(r + 3, c + 3)) {
          return {
            winner: val,
            winningLine: [getIndex(r, c), getIndex(r + 1, c + 1), getIndex(r + 2, c + 2), getIndex(r + 3, c + 3)]
          };
        }
      }
    }

    // 4. Diagonal Ascendente ↗️
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = getCell(r, c);
        if (val && val === getCell(r - 1, c + 1) && val === getCell(r - 2, c + 2) && val === getCell(r - 3, c + 3)) {
          return {
            winner: val,
            winningLine: [getIndex(r, c), getIndex(r - 1, c + 1), getIndex(r - 2, c + 2), getIndex(r - 3, c + 3)]
          };
        }
      }
    }

    // Empate
    if (board.every(cell => cell !== null)) {
      return { winner: 'draw', winningLine: null };
    }

    return null;
  }

  async getOrCreateSession(coupleId, gameType = 'tic-tac-toe') {
    let session = await this.gameSessionRepository.findByCoupleAndGame(coupleId, gameType);
    if (!session) {
      const boardSize = gameType === 'connect-four' ? 42 : 9;
      session = await this.gameSessionRepository.create({
        coupleId,
        gameType,
        players: [],
        state: {
          board: Array(boardSize).fill(null),
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

    this._broadcastState(coupleId, session, gameType);

    return session;
  }

  async makeMove(coupleId, username, colOrIndex, gameType = 'tic-tac-toe') {
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

    let boardIndex = -1;

    if (gameType === 'connect-four') {
      const col = Number(colOrIndex);
      if (isNaN(col) || col < 0 || col > 6) {
        throw new ApiError(400, 'Coluna inválida para o 4 em Linha.');
      }

      // Encontrar a linha livre mais baixa (linha 5 -> linha 0)
      const COLS = 7;
      for (let r = 5; r >= 0; r--) {
        if (session.state.board[r * COLS + col] === null) {
          boardIndex = r * COLS + col;
          break;
        }
      }

      if (boardIndex === -1) {
        throw new ApiError(400, 'Esta coluna já está cheia!');
      }
    } else {
      const index = Number(colOrIndex);
      if (isNaN(index) || index < 0 || index > 8 || session.state.board[index] !== null) {
        throw new ApiError(400, 'Célula inválida ou já ocupada.');
      }
      boardIndex = index;
    }

    // Aplicar a jogada
    session.state.board[boardIndex] = player.symbol;

    // Verificar vitória ou empate
    const result = GameSessionService.checkWinner(session.state.board, gameType);

    if (result) {
      session.state.status = 'finished';
      session.state.winner = result.winner;
      session.state.winningLine = result.winningLine;

      if (result.winner === 'draw') {
        session.state.scores.draws += 1;
        for (const p of session.players) {
          try {
            await this.gameScoreService.recordScore(coupleId, p.username, gameType, 20, { result: 'draw' });
          } catch (err) { /* ignore */ }
        }
      } else {
        const winningSymbol = result.winner;
        if (winningSymbol === 'X') session.state.scores.X += 1;
        if (winningSymbol === 'O') session.state.scores.O += 1;

        const winnerPlayer = session.players.find(p => p.symbol === winningSymbol);
        const loserPlayer = session.players.find(p => p.symbol !== winningSymbol);

        if (winnerPlayer) {
          try {
            await this.gameScoreService.recordScore(coupleId, winnerPlayer.username, gameType, 50, { result: 'win' });
          } catch (err) { /* ignore */ }
        }
        if (loserPlayer) {
          try {
            await this.gameScoreService.recordScore(coupleId, loserPlayer.username, gameType, 10, { result: 'loss_consolation' });
          } catch (err) { /* ignore */ }
        }
      }

      // Determinar quem perdeu para ser o primeiro a jogar na próxima partida
      let nextStarter = session.state.lastStarter === 'X' ? 'O' : 'X';
      if (result.winner && result.winner !== 'draw') {
        nextStarter = result.winner === 'X' ? 'O' : 'X';
      }
      session.state.lastStarter = nextStarter;

      // Agendar limpeza automática do tabuleiro e início de nova partida após 3.5s
      setTimeout(async () => {
        try {
          const freshSession = await this.gameSessionRepository.findByCoupleAndGame(coupleId, gameType);
          if (freshSession && freshSession.state.status === 'finished') {
            const boardSize = gameType === 'connect-four' ? 42 : 9;
            freshSession.state.board = Array(boardSize).fill(null);
            freshSession.state.currentTurn = nextStarter;
            freshSession.state.winner = null;
            freshSession.state.winningLine = null;
            freshSession.state.status = freshSession.players.length === 2 ? 'playing' : 'waiting';

            freshSession.markModified('state');
            freshSession.updatedAt = new Date();
            await freshSession.save();

            this._broadcastState(coupleId, freshSession, gameType);
          }
        } catch (err) {
          console.error('Erro na limpeza automática do tabuleiro:', err);
        }
      }, 3500);
    } else {
      // Alternar turno
      session.state.currentTurn = session.state.currentTurn === 'X' ? 'O' : 'X';
    }

    session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session, gameType);

    return session;
  }

  async resetSession(coupleId, username, gameType = 'tic-tac-toe') {
    const session = await this.getOrCreateSession(coupleId, gameType);

    let nextStarter = session.state.lastStarter === 'X' ? 'O' : 'X';
    if (session.state.winner && session.state.winner !== 'draw') {
      nextStarter = session.state.winner === 'X' ? 'O' : 'X';
    }

    const boardSize = gameType === 'connect-four' ? 42 : 9;
    session.state.board = Array(boardSize).fill(null);
    session.state.currentTurn = nextStarter;
    session.state.lastStarter = nextStarter;
    session.state.winner = null;
    session.state.winningLine = null;
    session.state.status = session.players.length === 2 ? 'playing' : 'waiting';

    session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session, gameType);

    return session;
  }

  async updateCustomization(coupleId, username, gameType = 'tic-tac-toe', { emoji, color }) {
    const session = await this.getOrCreateSession(coupleId, gameType);

    if (!session.state.customizations) {
      session.state.customizations = {};
    }

    // Verificar se o parceiro já está a usar esta cor ou emoji
    const partnerUsername = Object.keys(session.state.customizations).find(u => u !== username);
    if (partnerUsername) {
      const partnerCustom = session.state.customizations[partnerUsername];
      if (emoji && partnerCustom.emoji === emoji) {
        throw new ApiError(400, 'Este emoji já está em uso pelo teu parceiro! Escolhe outro.');
      }
      if (color && partnerCustom.color === color) {
        throw new ApiError(400, 'Esta cor já está em uso pelo teu parceiro! Escolhe outra.');
      }
    }

    session.state.customizations[username] = {
      emoji: emoji || '💖',
      color: color || 'pink'
    };

    session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session, gameType);

    return session;
  }

  _broadcastState(coupleId, session, gameType = 'tic-tac-toe') {
    try {
      const eventName = `${gameType}-update`;
      eventBus.emit('socket:emit', {
        room: coupleId,
        event: eventName,
        data: session.toObject ? session.toObject() : session
      });
    } catch (err) {
      console.error(`Erro ao emitir evento ${gameType}-update:`, err);
    }
  }
}

module.exports = GameSessionService;
