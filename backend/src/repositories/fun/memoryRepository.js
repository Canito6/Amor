const BaseRepository = require('../baseRepository');
const Memory = require('../../models/fun/memoryModel');

class MemoryRepository extends BaseRepository {
  constructor() {
    super(Memory);
  }
}

module.exports = MemoryRepository;
