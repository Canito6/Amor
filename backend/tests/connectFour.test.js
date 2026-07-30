const GameSessionService = require('../src/services/fun/gameSessionService');

describe('Testes de Lógica do 4 em Linha (Connect 4)', () => {
  it('Inicializa tabuleiro de 42 posições (7 colunas x 6 linhas)', async () => {
    let savedSession = null;
    const mockRepo = {
      findByCoupleAndGame: jest.fn(async () => null),
      create: jest.fn(async (data) => {
        savedSession = { ...data, save: jest.fn() };
        return savedSession;
      })
    };
    const service = new GameSessionService(mockRepo);
    const session = await service.getOrCreateSession('couple-1', 'connect-four');

    expect(session.gameType).toBe('connect-four');
    expect(session.state.board).toHaveLength(42);
    expect(session.state.board.every(c => c === null)).toBe(true);
  });

  it('Queda gravitacional de peça na coluna livre mais baixa (linha 5 -> 4 -> ...)', async () => {
    let inMemorySession = null;
    const mockRepo = {
      findByCoupleAndGame: jest.fn(async () => inMemorySession),
      create: jest.fn(async (data) => {
        inMemorySession = {
          ...data,
          save: jest.fn(async function() { return this; }),
          markModified: jest.fn()
        };
        return inMemorySession;
      })
    };
    const service = new GameSessionService(mockRepo);

    // Entrar com 2 jogadores
    await service.joinSession('couple-c4', 'Canito', 'connect-four');
    await service.joinSession('couple-c4', 'Lara', 'connect-four');

    // Canito joga na coluna 3 (deve ir para a linha 5, índice 5*7+3 = 38)
    let s = await service.makeMove('couple-c4', 'Canito', 3, 'connect-four');
    expect(s.state.board[38]).toBe('X');
    expect(s.state.currentTurn).toBe('O');

    // Lara joga também na coluna 3 (deve ir para a linha 4, índice 4*7+3 = 31)
    s = await service.makeMove('couple-c4', 'Lara', 3, 'connect-four');
    expect(s.state.board[31]).toBe('O');
    expect(s.state.currentTurn).toBe('X');
  });

  it('Rejeita jogada em coluna cheia (6 peças)', async () => {
    let inMemorySession = null;
    const mockRepo = {
      findByCoupleAndGame: jest.fn(async () => inMemorySession),
      create: jest.fn(async (data) => {
        inMemorySession = {
          ...data,
          save: jest.fn(async function() { return this; }),
          markModified: jest.fn()
        };
        return inMemorySession;
      })
    };
    const service = new GameSessionService(mockRepo);

    await service.joinSession('c4-full', 'User1', 'connect-four');
    await service.joinSession('c4-full', 'User2', 'connect-four');

    // Encher coluna 0 com 6 jogadas
    for (let i = 0; i < 6; i++) {
      const user = i % 2 === 0 ? 'User1' : 'User2';
      await service.makeMove('c4-full', user, 0, 'connect-four');
    }

    // 7ª jogada na coluna 0 deve lançar erro
    await expect(
      service.makeMove('c4-full', 'User1', 0, 'connect-four')
    ).rejects.toThrow('Esta coluna já está cheia!');
  });

  it('Deteta vitória em 4 em linha Horizontal', () => {
    const board = Array(42).fill(null);
    // Colocar X nas posições (r=5, c=0,1,2,3) -> índices 35, 36, 37, 38
    board[35] = 'X';
    board[36] = 'X';
    board[37] = 'X';
    board[38] = 'X';

    const res = GameSessionService.checkConnectFourWinner(board);
    expect(res).not.toBeNull();
    expect(res.winner).toBe('X');
    expect(res.winningLine).toEqual([35, 36, 37, 38]);
  });

  it('Deteta vitória em 4 em linha Vertical', () => {
    const board = Array(42).fill(null);
    // Colocar O nas posições (r=5,4,3,2, c=2) -> índices 37, 30, 23, 16
    board[37] = 'O';
    board[30] = 'O';
    board[23] = 'O';
    board[16] = 'O';

    const res = GameSessionService.checkConnectFourWinner(board);
    expect(res).not.toBeNull();
    expect(res.winner).toBe('O');
    expect(res.winningLine).toEqual([16, 23, 30, 37]);
  });

  it('Deteta vitória em 4 em linha Diagonal (↘️)', () => {
    const board = Array(42).fill(null);
    // (r=2,c=1), (r=3,c=2), (r=4,c=3), (r=5,c=4)
    // idx: 2*7+1=15, 3*7+2=23, 4*7+3=31, 5*7+4=39
    board[15] = 'X';
    board[23] = 'X';
    board[31] = 'X';
    board[39] = 'X';

    const res = GameSessionService.checkConnectFourWinner(board);
    expect(res).not.toBeNull();
    expect(res.winner).toBe('X');
    expect(res.winningLine).toEqual([15, 23, 31, 39]);
  });

  it('Deteta vitória em 4 em linha Diagonal (↗️)', () => {
    const board = Array(42).fill(null);
    // (r=5,c=1), (r=4,c=2), (r=3,c=3), (r=2,c=4)
    // idx: 5*7+1=36, 4*7+2=30, 3*7+3=24, 2*7+4=18
    board[36] = 'O';
    board[30] = 'O';
    board[24] = 'O';
    board[18] = 'O';

    const res = GameSessionService.checkConnectFourWinner(board);
    expect(res).not.toBeNull();
    expect(res.winner).toBe('O');
    expect(res.winningLine).toEqual([36, 30, 24, 18]);
  });
});
