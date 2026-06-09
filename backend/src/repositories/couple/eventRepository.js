const BaseRepository = require('../baseRepository');
const Event = require('../../models/couple/eventModel');

class EventRepository extends BaseRepository {
  constructor() {
    super(Event);
  }
}

module.exports = EventRepository;
