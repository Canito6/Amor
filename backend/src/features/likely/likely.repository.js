const BaseRepository = require('../../repositories/baseRepository');
const LikelyQuestion = require('./likely.model');

class LikelyQuestionRepository extends BaseRepository {
  constructor() {
    super(LikelyQuestion);
  }
}

module.exports = LikelyQuestionRepository;
