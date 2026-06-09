const BaseRepository = require('../baseRepository');
const Photo = require('../../models/gallery/photoModel');

class PhotoRepository extends BaseRepository {
  constructor() {
    super(Photo);
  }
}

module.exports = PhotoRepository;
