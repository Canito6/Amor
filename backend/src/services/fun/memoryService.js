const ApiError = require('../../utils/apiError');

class MemoryService {
  constructor(memoryRepository) {
    this.memoryRepository = memoryRepository;
  }

  async getMemories(coupleId) {
    const memories = await this.memoryRepository.find({ coupleId }, { date: 1 });
    
    return memories.map(mem => {
      const isLocked = mem.isTimeCapsule && mem.unlockDate && new Date(mem.unlockDate) > new Date();
      if (isLocked) {
        return {
          _id: mem._id,
          title: 'Cápsula do Tempo Trancada 🔒',
          description: '',
          date: mem.date,
          createdBy: mem.createdBy,
          createdAt: mem.createdAt,
          isTimeCapsule: true,
          unlockDate: mem.unlockDate,
          locked: true
        };
      }
      
      const memObj = mem.toObject();
      memObj.locked = false;
      return memObj;
    });
  }

  async createMemory(data, username, coupleId) {
    const cleanData = {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      date: new Date(data.date),
      isTimeCapsule: !!data.isTimeCapsule,
      unlockDate: data.isTimeCapsule ? new Date(data.unlockDate) : null,
      imageUrl: data.imageUrl ? data.imageUrl.trim() : '',
      coupleId: coupleId,
      createdBy: username
    };

    const novaMemoria = await this.memoryRepository.create(cleanData);
    
    const memObj = novaMemoria.toObject();
    const isLocked = memObj.isTimeCapsule && memObj.unlockDate && new Date(memObj.unlockDate) > new Date();
    memObj.locked = isLocked;
    if (isLocked) {
      memObj.title = 'Cápsula do Tempo Trancada 🔒';
      memObj.description = '';
    }
    
    return memObj;
  }

  async editMemory(id, data, username, role, coupleId) {
    const memory = await this.memoryRepository.findById(id);
    if (!memory) {
      throw new ApiError(404, 'Memória não encontrada.');
    }

    if (memory.coupleId !== coupleId && role !== 'admin') {
      throw new ApiError(403, 'Não tens permissão para aceder a esta memória.');
    }

    if (memory.createdBy !== username && role !== 'admin') {
      throw new ApiError(403, 'Não tens permissão para editar este momento.');
    }

    memory.title = data.title.trim();
    memory.description = data.description ? data.description.trim() : '';
    memory.date = new Date(data.date);
    memory.isTimeCapsule = !!data.isTimeCapsule;
    memory.unlockDate = data.isTimeCapsule ? new Date(data.unlockDate) : null;
    memory.imageUrl = data.imageUrl ? data.imageUrl.trim() : '';
    
    if (data.isTimeCapsule && memory.unlockDate > new Date()) {
      memory.notified = false;
    }

    await memory.save();

    const memObj = memory.toObject();
    const isLocked = memObj.isTimeCapsule && memObj.unlockDate && new Date(memObj.unlockDate) > new Date();
    memObj.locked = isLocked;
    if (isLocked) {
      memObj.title = 'Cápsula do Tempo Trancada 🔒';
      memObj.description = '';
    }

    return memObj;
  }
}

module.exports = MemoryService;
