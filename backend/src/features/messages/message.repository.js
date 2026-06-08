const BaseRepository = require('../../repositories/baseRepository');
const Message = require('./message.model');

class MessageRepository extends BaseRepository {
  constructor() {
    super(Message);
  }
}

module.exports = MessageRepository;
