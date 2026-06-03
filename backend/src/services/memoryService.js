const Memory = require('../models/Memory');
const ApiError = require('../utils/apiError');

class MemoryService {
  async getMemories(coupleId) {
    const memories = await Memory.find({ coupleId }).sort({ date: 1 });
    
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
      coupleId: coupleId,
      createdBy: username
    };

    const novaMemoria = new Memory(cleanData);
    await novaMemoria.save();
    
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
    const memory = await Memory.findById(id);
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

module.exports = new MemoryService();
