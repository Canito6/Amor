const BaseRepository = require('../baseRepository');
const Album = require('../../models/gallery/albumModel');

class AlbumRepository extends BaseRepository {
  constructor() {
    super(Album);
  }
}

module.exports = AlbumRepository;
