const BaseRepository = require('../../repositories/baseRepository');
const JarNote = require('./jar.model');

class JarNoteRepository extends BaseRepository {
  constructor() {
    super(JarNote);
  }
}

module.exports = JarNoteRepository;
