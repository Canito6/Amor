const BaseRepository = require('../baseRepository');
const Tab = require('../../models/couple/tabModel');

class TabRepository extends BaseRepository {
  constructor() {
    super(Tab);
  }
}

module.exports = TabRepository;
