const TruthOrDareService = require('../src/services/fun/truthOrDareService');

describe('TruthOrDareService (Ponto 3)', () => {
  let repository;
  let service;

  beforeEach(() => {
    const sessions = new Map();
    repository = {
      findByCoupleAndGame: jest.fn(async (coupleId, gameType) => sessions.get(`${coupleId}_${gameType}`) || null),
      create: jest.fn(async (data) => {
        const obj = { ...data, _id: 'session-id', save: jest.fn() };
        sessions.set(`${data.coupleId}_${data.gameType}`, obj);
        return obj;
      })
    };
    service = new TruthOrDareService(repository);
  });

  test('Deve criar e registar 2 jogadores na sessão de Verdade ou Consequência', async () => {
    await service.joinSession('couple-1', 'Canito');
    const session = await service.joinSession('couple-1', 'Lara');

    expect(session.players.length).toBe(2);
    expect(session.state.truthsCount['Canito']).toBe(0);
    expect(session.state.truthsCount['Lara']).toBe(0);
    expect(session.state.level).toBe('medium');
    expect(session.state.mode).toBe('ai');
  });

  test('Deve tirar uma carta de Verdade e incrementar o contador de verdades', async () => {
    await service.joinSession('couple-1', 'Canito');
    await service.joinSession('couple-1', 'Lara');

    const updated = await service.drawCard('couple-1', 'Canito', { type: 'truth' });

    expect(updated.state.truthsCount['Canito']).toBe(1);
    expect(updated.state.activeCard).not.toBeNull();
    expect(updated.state.activeCard.type).toBe('truth');
    expect(updated.state.activeCard.status).toBe('pending');
    expect(updated.state.activeCard.drawnBy).toBe('Canito');
  });

  test('REGRA DAS 3 VERDADES: Deve bloquear a 4ª Verdade e lançar um erro 400', async () => {
    await service.joinSession('couple-1', 'Canito');
    await service.joinSession('couple-1', 'Lara');

    // Gastar 3 verdades
    await service.drawCard('couple-1', 'Canito', { type: 'truth' });
    await service.completeCard('couple-1', 'Canito');

    await service.drawCard('couple-1', 'Canito', { type: 'truth' });
    await service.completeCard('couple-1', 'Canito');

    await service.drawCard('couple-1', 'Canito', { type: 'truth' });
    await service.completeCard('couple-1', 'Canito');

    expect(service.drawCard('couple-1', 'Canito', { type: 'truth' }))
      .rejects.toThrow('Esgotaste as tuas 3 Verdades por jogo!');
  });

  test('Deve permitir tirar Consequência mesmo após gastar 3 verdades', async () => {
    await service.joinSession('couple-1', 'Canito');
    await service.joinSession('couple-1', 'Lara');

    // Gastar 3 verdades
    await service.drawCard('couple-1', 'Canito', { type: 'truth' });
    await service.completeCard('couple-1', 'Canito');
    await service.drawCard('couple-1', 'Canito', { type: 'truth' });
    await service.completeCard('couple-1', 'Canito');
    await service.drawCard('couple-1', 'Canito', { type: 'truth' });
    await service.completeCard('couple-1', 'Canito');

    // 4ª tentativa com Consequência deve ser aceite!
    const updated = await service.drawCard('couple-1', 'Canito', { type: 'dare' });
    expect(updated.state.activeCard.type).toBe('dare');
  });

  test('PENALIZAÇÃO OBRIGATÓRIA: Deve atribuir penalização inegociável ao recusar consequência', async () => {
    await service.joinSession('couple-1', 'Canito');
    await service.joinSession('couple-1', 'Lara');

    await service.drawCard('couple-1', 'Canito', { type: 'dare' });
    const refused = await service.refuseCard('couple-1', 'Canito');

    expect(refused.state.activeCard.status).toBe('penalty');
    expect(refused.state.activeCard.penaltyContent).toBeTruthy();

    const completed = await service.completePenalty('couple-1', 'Canito');
    expect(completed.state.activeCard.status).toBe('completed');
  });

  test('Deve atualizar os níveis Fácil, Médio e Difícil (🔥🔞) e modo IA/Manual', async () => {
    await service.joinSession('couple-1', 'Canito');

    let updated = await service.updateSettings('couple-1', 'Canito', { level: 'hard', mode: 'manual' });
    expect(updated.state.level).toBe('hard');
    expect(updated.state.mode).toBe('manual');

    // No modo manual com customText
    updated = await service.drawCard('couple-1', 'Canito', { type: 'dare', customText: 'Desafio secreto!' });
    expect(updated.state.activeCard.content).toBe('Desafio secreto!');
    expect(updated.state.activeCard.level).toBe('hard');
  });

  test('Deve reiniciar o jogo e limpar cartas ativas, pontuações, verdades e histórico', async () => {
    await service.joinSession('couple-1', 'Canito');
    await service.joinSession('couple-1', 'Lara');

    await service.drawCard('couple-1', 'Canito', { type: 'truth' });
    await service.completeCard('couple-1', 'Canito');

    const reset = await service.resetGame('couple-1', 'Canito');

    expect(reset.state.activeCard).toBeNull();
    expect(reset.state.truthsCount['Canito']).toBe(0);
    expect(reset.state.truthsCount['Lara']).toBe(0);
    expect(reset.state.scores['Canito']).toBe(0);
    expect(reset.state.scores['Lara']).toBe(0);
    expect(reset.state.history.length).toBe(0);
  });
});
