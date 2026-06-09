const BaseRepository = require('../baseRepository');
const Message = require('../../models/chat/messageModel');

class MessageRepository extends BaseRepository {
  constructor() {
    super(Message);
  }
}

module.exports = MessageRepository;
