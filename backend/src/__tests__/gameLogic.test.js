const assert = require('assert');
const { test, describe } = require('node:test');

// Testes isolados sem necessidade de ligação a MongoDB real
describe('Testes de Lógica do Jogo do Galo e Sistema de Pontuação', () => {

  test('container.js carrega Repositórios, Serviços e Controladores de jogos sem erros', () => {
    const container = require('../container');
    assert.ok(container.gameScoreRepository, 'gameScoreRepository deve estar no container');
    assert.ok(container.gameScoreService, 'gameScoreService deve estar no container');
    assert.ok(container.gameScoreController, 'gameScoreController deve estar no container');
    assert.ok(container.gameSessionRepository, 'gameSessionRepository deve estar no container');
    assert.ok(container.gameSessionService, 'gameSessionService deve estar no container');
    assert.ok(container.gameSessionController, 'gameSessionController deve estar no container');
  });

  test('Deteção de vitória e combinações no Jogo do Galo', () => {
    const GameSessionService = require('../services/fun/gameSessionService');

    // Linha horizontal superior (X vence)
    const boardWinX = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
    const resX = GameSessionService.checkWinner(boardWinX);
    assert.strictEqual(resX.winner, 'X');
    assert.deepStrictEqual(resX.winningLine, [0, 1, 2]);

    // Diagonal (O vence)
    const boardWinO = ['O', 'X', 'X', null, 'O', 'X', null, null, 'O'];
    const resO = GameSessionService.checkWinner(boardWinO);
    assert.strictEqual(resO.winner, 'O');
    assert.deepStrictEqual(resO.winningLine, [0, 4, 8]);

    // Empate (grelha cheia sem 3 em linha)
    const boardDraw = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    const resDraw = GameSessionService.checkWinner(boardDraw);
    assert.strictEqual(resDraw.winner, 'draw');

    // Jogo em curso (sem vencedor)
    const boardPlaying = ['X', 'O', null, null, null, null, null, null, null];
    const resPlaying = GameSessionService.checkWinner(boardPlaying);
    assert.strictEqual(resPlaying, null);
  });

  test('GameScoreService rejeita submissão direta do cliente para tic-tac-toe', async () => {
    const GameScoreService = require('../services/fun/gameScoreService');
    const mockRepo = { create: async (d) => d };
    const service = new GameScoreService(mockRepo);

    await assert.rejects(
      async () => {
        await service.submitClientScore('couple-1', 'user1', 'tic-tac-toe', 50);
      },
      (err) => {
        return err.statusCode === 400 && err.message.includes('não permite submissão direta');
      }
    );
  });

  test('GameScoreService rejeita submissões com pontos acima do limite', async () => {
    const GameScoreService = require('../services/fun/gameScoreService');
    const mockRepo = { create: async (d) => d };
    const service = new GameScoreService(mockRepo);

    await assert.rejects(
      async () => {
        await service.submitClientScore('couple-1', 'user1', 'memory', 999);
      },
      (err) => {
        return err.statusCode === 400 && err.message.includes('excede o limite máximo');
      }
    );
  });

  test('GameScoreService suporta reset de pontuações e consulta por período', async () => {
    const GameScoreService = require('../services/fun/gameScoreService');
    let resetCalled = false;
    const mockRepo = {
      getScoreSummary: async (coupleId, period) => ({ period, totalCouplePoints: 100, byUser: {}, byGame: {} }),
      deleteCoupleScores: async (coupleId) => { resetCalled = true; }
    };
    const service = new GameScoreService(mockRepo);

    const summaryMonth = await service.getSummary('couple-1', 'month');
    assert.strictEqual(summaryMonth.period, 'month');

    const resetRes = await service.resetScores('couple-1', 'Canito');
    assert.strictEqual(resetCalled, true);
    assert.ok(resetRes.message.includes('reiniciadas'));
  });

  test('Fluxo simulado de sessão do Jogo do Galo', async () => {
    const GameSessionService = require('../services/fun/gameSessionService');
    
    // Mock do repositório em memória
    let inMemorySession = null;
    const mockSessionRepo = {
      findByCoupleAndGame: async () => inMemorySession,
      create: async (data) => {
        inMemorySession = {
          ...data,
          save: async function() { return this; },
          markModified: function() {}
        };
        return inMemorySession;
      }
    };

    const mockScoreRepo = { create: async (d) => d };
    const scoreService = require('../services/fun/gameScoreService');
    const scoreServiceInst = new scoreService(mockScoreRepo);
    const sessionService = new GameSessionService(mockSessionRepo, scoreServiceInst);

    // 1. Jogador 1 junta-se (recebe X)
    let s = await sessionService.joinSession('couple-123', 'Romeo');
    assert.strictEqual(s.players.length, 1);
    assert.strictEqual(s.players[0].symbol, 'X');

    // 2. Jogador 2 junta-se (recebe O)
    s = await sessionService.joinSession('couple-123', 'Juliet');
    assert.strictEqual(s.players.length, 2);
    assert.strictEqual(s.players[1].symbol, 'O');
    assert.strictEqual(s.state.status, 'playing');

    // 3. Sequência de jogadas: Romeo(0), Juliet(3), Romeo(1), Juliet(4), Romeo(2) -> Romeo vence!
    s = await sessionService.makeMove('couple-123', 'Romeo', 0);
    s = await sessionService.makeMove('couple-123', 'Juliet', 3);
    s = await sessionService.makeMove('couple-123', 'Romeo', 1);
    s = await sessionService.makeMove('couple-123', 'Juliet', 4);
    s = await sessionService.makeMove('couple-123', 'Romeo', 2);

    assert.strictEqual(s.state.status, 'finished');
    assert.strictEqual(s.state.winner, 'X');
    assert.strictEqual(s.state.scores.X, 1);
    assert.strictEqual(s.state.scores.O, 0);

    // 4. Reinício da partida -> Perdedor (Juliet / O) passa a começar!
    s = await sessionService.resetSession('couple-123', 'Juliet');
    assert.strictEqual(s.state.status, 'playing');
    assert.strictEqual(s.state.currentTurn, 'O');
    assert.strictEqual(s.state.board.every(cell => cell === null), true);
  });
});
