const BaseRepository = require('../baseRepository');
const JarNote = require('../../models/fun/jarModel');

class JarNoteRepository extends BaseRepository {
  constructor() {
    super(JarNote);
  }
}

module.exports = JarNoteRepository;
