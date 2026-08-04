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

  describe('Modo Duelo (cada jogador escolhe uma palavra para o outro)', () => {
    beforeEach(async () => {
      await service.joinSession('couple-duel', 'Canito');
      await service.joinSession('couple-duel', 'Lara');
      await service.updateSettings('couple-duel', 'Canito', { mode: 'duel' });
    });

    test('Deve entrar em modo "setting-duel" e só começar a jogar quando AMBOS definirem a palavra do outro', async () => {
      const afterCanitoSets = await service.setDuelWord('couple-duel', 'Canito', { word: 'AMOR', hint: 'curto' });
      // A palavra do Canito é para a Lara adivinhar
      expect(afterCanitoSets.state.duel.wordFor['Lara']).toBe('AMOR');
      expect(afterCanitoSets.state.status).toBe('setting-duel');

      const afterLaraSets = await service.setDuelWord('couple-duel', 'Lara', { word: 'BEIJO', hint: 'gesto' });
      // A palavra da Lara é para o Canito adivinhar
      expect(afterLaraSets.state.duel.wordFor['Canito']).toBe('BEIJO');
      // Agora que ambos definiram, o duelo começa
      expect(afterLaraSets.state.status).toBe('playing');
    });

    test('Não deve permitir adivinhar antes de o parceiro definir a tua palavra', async () => {
      await service.setDuelWord('couple-duel', 'Canito', { word: 'AMOR', hint: '' });
      // Lara já pode adivinhar (Canito definiu a palavra dela), mas Canito ainda não tem palavra
      await expect(service.makeDuelGuess('couple-duel', 'Canito', 'BEIJO')).rejects.toThrow();
    });

    test('Deve declarar vencedor quem acertar com menos tentativas', async () => {
      await service.setDuelWord('couple-duel', 'Canito', { word: 'AMOR', hint: '' });
      await service.setDuelWord('couple-duel', 'Lara', { word: 'BEIJO', hint: '' });

      // Lara acerta a palavra do Canito ("AMOR") à primeira tentativa
      await service.makeDuelGuess('couple-duel', 'Lara', 'AMOR');
      // Canito falha uma vez e acerta a palavra da Lara ("BEIJO") à segunda tentativa
      await service.makeDuelGuess('couple-duel', 'Canito', 'ROMAS');
      const finalState = await service.makeDuelGuess('couple-duel', 'Canito', 'BEIJO');

      expect(finalState.state.status).toBe('finished');
      expect(finalState.state.duel.winnerOverall).toBe('Lara');
      expect(finalState.state.scores['Lara']).toBe(50);
      expect(finalState.state.scores['Canito']).toBe(50);
    });

    test('Deve dar empate se nenhum dos dois acertar dentro do limite de tentativas', async () => {
      await service.setDuelWord('couple-duel', 'Canito', { word: 'AMOR', hint: '' });
      await service.setDuelWord('couple-duel', 'Lara', { word: 'BEIJO', hint: '' });

      // Ambos esgotam as 6 tentativas sem acertar (guesses do mesmo tamanho que a palavra-alvo de cada um)
      let finalState;
      for (let i = 0; i < 6; i++) {
        await service.makeDuelGuess('couple-duel', 'Lara', 'ERRO');
        finalState = await service.makeDuelGuess('couple-duel', 'Canito', 'ERROU');
      }

      expect(finalState.state.status).toBe('finished');
      expect(finalState.state.duel.winnerOverall).toBe('draw');
    });
  });
});
