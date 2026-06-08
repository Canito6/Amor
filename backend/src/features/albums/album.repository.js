const BaseRepository = require('../../repositories/baseRepository');
const Album = require('./album.model');

class AlbumRepository extends BaseRepository {
  constructor() {
    super(Album);
  }
}

module.exports = AlbumRepository;
