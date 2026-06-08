const BaseRepository = require('../../repositories/baseRepository');
const Event = require('./event.model');

class EventRepository extends BaseRepository {
  constructor() {
    super(Event);
  }
}

module.exports = EventRepository;
