const BaseRepository = require('../../repositories/baseRepository');
const OpenWhenLetter = require('./openWhen.model');

class OpenWhenLetterRepository extends BaseRepository {
  constructor() {
    super(OpenWhenLetter);
  }
}

module.exports = OpenWhenLetterRepository;
