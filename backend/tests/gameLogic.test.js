const container = require('../src/container');
const GameSessionService = require('../src/services/fun/gameSessionService');
const GameScoreService = require('../src/services/fun/gameScoreService');

describe('Testes de Lógica do Jogo do Galo e Sistema de Pontuação', () => {

  it('container.js carrega Repositórios, Serviços e Controladores de jogos sem erros', () => {
    expect(container.gameScoreRepository).toBeDefined();
    expect(container.gameScoreService).toBeDefined();
    expect(container.gameScoreController).toBeDefined();
    expect(container.gameSessionRepository).toBeDefined();
    expect(container.gameSessionService).toBeDefined();
    expect(container.gameSessionController).toBeDefined();
  });

  it('Deteção de vitória e combinações no Jogo do Galo', () => {
    // Linha horizontal superior (X vence)
    const boardWinX = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    const resX = GameSessionService.checkWinner(boardWinX);
    expect(resX.winner).toBe('X');
    expect(resX.winningLine).toEqual([0, 1, 2]);

    // Diagonal (O vence)
    const boardWinO = ['O', 'X', 'X', null, 'O', 'X', null, null, 'O'];
    const resO = GameSessionService.checkWinner(boardWinO);
    expect(resO.winner).toBe('O');
    expect(resO.winningLine).toEqual([0, 4, 8]);

    // Empate (grelha cheia sem 3 em linha)
    const boardDraw = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    const resDraw = GameSessionService.checkWinner(boardDraw);
    expect(resDraw.winner).toBe('draw');

    // Jogo em curso (sem vencedor)
    const boardPlaying = ['X', 'O', null, null, null, null, null, null, null];
    const resPlaying = GameSessionService.checkWinner(boardPlaying);
    expect(resPlaying).toBeNull();
  });

  it('GameScoreService rejeita submissão direta do cliente para tic-tac-toe', async () => {
    const mockRepo = { create: jest.fn(async (d) => d) };
    const service = new GameScoreService(mockRepo);

    await expect(
      service.submitClientScore('couple-1', 'user1', 'tic-tac-toe', 50)
    ).rejects.toThrow('não permite submissão direta');
  });

  it('GameScoreService rejeita submissões com pontos acima do limite', async () => {
    const mockRepo = { create: jest.fn(async (d) => d) };
    const service = new GameScoreService(mockRepo);

    await expect(
      service.submitClientScore('couple-1', 'user1', 'memory', 999)
    ).rejects.toThrow('excede o limite máximo');
  });

  it('GameScoreService suporta reset de pontuações e consulta por período', async () => {
    let resetCalled = false;
    const mockRepo = {
      getScoreSummary: jest.fn(async (coupleId, period) => ({ period, totalCouplePoints: 100, byUser: {}, byGame: {} })),
      deleteCoupleScores: jest.fn(async (coupleId) => { resetCalled = true; })
    };
    const service = new GameScoreService(mockRepo);

    const summaryMonth = await service.getSummary('couple-1', 'month');
    expect(summaryMonth.period).toBe('month');

    const resetRes = await service.resetScores('couple-1', 'Canito');
    expect(resetCalled).toBe(true);
    expect(resetRes.message).toContain('reiniciadas');
  });

  it('Fluxo simulado de sessão do Jogo do Galo', async () => {
    let inMemorySession = null;
    const mockSessionRepo = {
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

    const mockScoreRepo = { create: jest.fn(async (d) => d) };
    const scoreServiceInst = new GameScoreService(mockScoreRepo);
    const sessionService = new GameSessionService(mockSessionRepo, scoreServiceInst);

    // 1. Jogador 1 junta-se (recebe X)
    let s = await sessionService.joinSession('couple-123', 'Romeo');
    expect(s.players).toHaveLength(1);
    expect(s.players[0].symbol).toBe('X');

    // 2. Jogador 2 junta-se (recebe O)
    s = await sessionService.joinSession('couple-123', 'Juliet');
    expect(s.players).toHaveLength(2);
    expect(s.players[1].symbol).toBe('O');
    expect(s.state.status).toBe('playing');

    // 3. Sequência de jogadas: Romeo(0), Juliet(3), Romeo(1), Juliet(4), Romeo(2) -> Romeo vence!
    s = await sessionService.makeMove('couple-123', 'Romeo', 0);
    s = await sessionService.makeMove('couple-123', 'Juliet', 3);
    s = await sessionService.makeMove('couple-123', 'Romeo', 1);
    s = await sessionService.makeMove('couple-123', 'Juliet', 4);
    s = await sessionService.makeMove('couple-123', 'Romeo', 2);

    expect(s.state.status).toBe('finished');
    expect(s.state.winner).toBe('X');
    expect(s.state.scores.X).toBe(1);
    expect(s.state.scores.O).toBe(0);

    // 4. Reinício da partida -> Perdedor (Juliet / O) passa a começar!
    s = await sessionService.resetSession('couple-123', 'Juliet');
    expect(s.state.status).toBe('playing');
    expect(s.state.currentTurn).toBe('O');
    expect(s.state.board.every(cell => cell === null)).toBe(true);
  });
});
