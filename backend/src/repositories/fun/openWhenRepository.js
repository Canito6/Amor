const BaseRepository = require('../baseRepository');
const OpenWhenLetter = require('../../models/fun/openWhenModel');

class OpenWhenLetterRepository extends BaseRepository {
  constructor() {
    super(OpenWhenLetter);
  }
}

module.exports = OpenWhenLetterRepository;
