const BaseRepository = require('../../repositories/baseRepository');
const Tab = require('./tab.model');

class TabRepository extends BaseRepository {
  constructor() {
    super(Tab);
  }
}

module.exports = TabRepository;
