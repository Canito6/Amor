const BaseRepository = require('../baseRepository');
const Quiz = require('../../models/fun/quizModel');

class QuizRepository extends BaseRepository {
  constructor() {
    super(Quiz);
  }
}

module.exports = QuizRepository;
