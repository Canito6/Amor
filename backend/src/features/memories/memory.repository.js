const BaseRepository = require('../../repositories/baseRepository');
const Memory = require('./memory.model');

class MemoryRepository extends BaseRepository {
  constructor() {
    super(Memory);
  }
}

module.exports = MemoryRepository;
