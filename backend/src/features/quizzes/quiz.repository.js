const BaseRepository = require('../../repositories/baseRepository');
const Quiz = require('./quiz.model');

class QuizRepository extends BaseRepository {
  constructor() {
    super(Quiz);
  }
}

module.exports = QuizRepository;
