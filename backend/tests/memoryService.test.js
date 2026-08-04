const MemoryService = require('../src/services/fun/memoryService');

describe('MemoryService Unit Tests', () => {
  let memoryService;
  let mockMemoryRepository;

  beforeEach(() => {
    mockMemoryRepository = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn()
    };
    memoryService = new MemoryService(mockMemoryRepository);
  });

  describe('getMemories', () => {
    it('should correctly process lean memories without throwing toObject error', async () => {
      const mockLeanMemories = [
        {
          _id: 'mem1',
          title: 'Primeiro encontro',
          description: 'Café no parque',
          date: new Date('2025-01-01'),
          createdBy: 'user1',
          coupleId: 'couple123',
          isTimeCapsule: false
        },
        {
          _id: 'mem2',
          title: 'Cápsula do tempo',
          description: 'Segredo',
          date: new Date('2025-01-02'),
          createdBy: 'user1',
          coupleId: 'couple123',
          isTimeCapsule: true,
          unlockDate: new Date(Date.now() + 1000000)
        }
      ];

      mockMemoryRepository.find.mockResolvedValue(mockLeanMemories);

      const result = await memoryService.getMemories('couple123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        _id: 'mem1',
        title: 'Primeiro encontro',
        description: 'Café no parque',
        date: new Date('2025-01-01'),
        createdBy: 'user1',
        coupleId: 'couple123',
        isTimeCapsule: false,
        locked: false
      });
      expect(result[1].locked).toBe(true);
      expect(result[1].title).toBe('Cápsula do Tempo Trancada 🔒');
      expect(result[1].description).toBe('');
    });
  });

  describe('createMemory', () => {
    it('should correctly create memory from lean object response', async () => {
      const newMemData = {
        title: 'Viagem à praia',
        description: 'Dia de sol',
        date: '2025-06-01',
        isTimeCapsule: false
      };

      const mockCreated = {
        _id: 'mem3',
        title: 'Viagem à praia',
        description: 'Dia de sol',
        date: new Date('2025-06-01'),
        isTimeCapsule: false,
        createdBy: 'user1',
        coupleId: 'couple123'
      };

      mockMemoryRepository.create.mockResolvedValue(mockCreated);

      const result = await memoryService.createMemory(newMemData, 'user1', 'couple123');

      expect(result.title).toBe('Viagem à praia');
      expect(result.locked).toBe(false);
    });
  });
});
