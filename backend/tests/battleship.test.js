const BattleshipService = require('../src/services/fun/battleshipService');

describe('BattleshipService (Ponto 4)', () => {
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
    service = new BattleshipService(repository);
  });

  test('Deve registar 2 jogadores e inicializar estado de setup', async () => {
    await service.joinSession('couple-bs', 'Canito');
    const session = await service.joinSession('couple-bs', 'Lara');

    expect(session.players.length).toBe(2);
    expect(session.state.status).toBe('setup');
    expect(session.state.boards['Canito']).toBeDefined();
    expect(session.state.boards['Lara']).toBeDefined();
  });

  test('Deve posicionar os 3 navios e ativar o jogo quando ambos estão prontos', async () => {
    await service.joinSession('couple-bs', 'Canito');
    await service.joinSession('couple-bs', 'Lara');

    const shipsCanito = [
      { id: 'heart', indices: [0, 1, 2] },
      { id: 'boat', indices: [10, 11] },
      { id: 'island', indices: [20] }
    ];

    const shipsLara = [
      { id: 'heart', indices: [5, 11, 17] },
      { id: 'boat', indices: [25, 26] },
      { id: 'island', indices: [35] }
    ];

    await service.placeShips('couple-bs', 'Canito', shipsCanito);
    const session = await service.placeShips('couple-bs', 'Lara', shipsLara);

    expect(session.state.ready['Canito']).toBe(true);
    expect(session.state.ready['Lara']).toBe(true);
    expect(session.state.status).toBe('playing');
  });

  test('Deve registar ataque na água (água 🌊) e passar o turno ao parceiro', async () => {
    await service.joinSession('couple-bs', 'Canito');
    await service.joinSession('couple-bs', 'Lara');

    await service.placeShips('couple-bs', 'Canito', [
      { id: 'heart', indices: [0, 1, 2] },
      { id: 'boat', indices: [10, 11] },
      { id: 'island', indices: [20] }
    ]);
    await service.placeShips('couple-bs', 'Lara', [
      { id: 'heart', indices: [5, 11, 17] },
      { id: 'boat', indices: [25, 26] },
      { id: 'island', indices: [35] }
    ]);

    // Canito ataca a posição 0 (onde Lara não tem navios) -> Água!
    const session = await service.attack('couple-bs', 'Canito', 0);
    expect(session.state.attacks['Canito'][0]).toBe('water');
    expect(session.state.currentTurn).toBe('Lara');
  });

  test('Deve registar tiro certeiro (hit 💥), afundar navio (sunk 💣) e gerar desafio IA', async () => {
    await service.joinSession('couple-bs', 'Canito');
    await service.joinSession('couple-bs', 'Lara');

    await service.placeShips('couple-bs', 'Canito', [
      { id: 'heart', indices: [0, 1, 2] },
      { id: 'boat', indices: [10, 11] },
      { id: 'island', indices: [20] }
    ]);
    await service.placeShips('couple-bs', 'Lara', [
      { id: 'heart', indices: [5, 11, 17] },
      { id: 'boat', indices: [25, 26] },
      { id: 'island', indices: [35] }
    ]);

    // Canito ataca a Ilha Secreta da Lara (posição 35, tamanho 1)
    const session = await service.attack('couple-bs', 'Canito', 35);

    expect(session.state.attacks['Canito'][35]).toBe('sunk');
    expect(session.state.activeChallenge).not.toBeNull();
    expect(session.state.activeChallenge.shipName).toContain('Ilha Secreta');
  });
});
