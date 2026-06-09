const BaseRepository = require('../baseRepository');
const LikelyQuestion = require('../../models/fun/likelyModel');

class LikelyQuestionRepository extends BaseRepository {
  constructor() {
    super(LikelyQuestion);
  }
}

module.exports = LikelyQuestionRepository;
