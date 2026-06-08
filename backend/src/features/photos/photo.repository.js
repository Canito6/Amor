const BaseRepository = require('../../repositories/baseRepository');
const Photo = require('./photo.model');

class PhotoRepository extends BaseRepository {
  constructor() {
    super(Photo);
  }
}

module.exports = PhotoRepository;
