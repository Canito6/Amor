const WordleService = require('../src/services/fun/wordleService');

describe('WordleService (Ponto 6)', () => {
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
    service = new WordleService(repository);
  });

  test('Deve avaliar tentativas com correct, present e absent', () => {
    const secret = 'AMOR';
    const guess1 = 'AMOR';
    expect(WordleService.evaluateGuess(secret, guess1)).toEqual(['correct', 'correct', 'correct', 'correct']);

    const guess2 = 'ROMA';
    expect(WordleService.evaluateGuess(secret, guess2)).toEqual(['present', 'present', 'present', 'present']);

    const guess3 = 'CASA';
    expect(WordleService.evaluateGuess(secret, guess3)).toEqual(['absent', 'present', 'absent', 'absent']);
  });

  test('Deve registar tentativas e atribuir vitória ao acertar a palavra', async () => {
    await service.joinSession('couple-wordle', 'Canito');
    await service.joinSession('couple-wordle', 'Lara');
    await service.setManualWord('couple-wordle', 'Lara', { word: 'BEIJO', hint: 'Gesto carinhoso' });

    const s1 = await service.makeGuess('couple-wordle', 'Canito', 'AMOUR');
    expect(s1.state.attempts.length).toBe(1);
    expect(s1.state.status).toBe('playing');

    const s2 = await service.makeGuess('couple-wordle', 'Canito', 'BEIJO');
    expect(s2.state.status).toBe('finished');
    expect(s2.state.winner).toBe('Canito');
    expect(s2.state.scores['Canito']).toBe(50);
  });
});
