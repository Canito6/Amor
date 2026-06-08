class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(filter = {}, sort = {}) {
    return this.model.find(filter).sort(sort);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async create(data) {
    return this.model.create(data);
  }

  async findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async countDocuments(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async updateMany(filter = {}, update = {}) {
    return this.model.updateMany(filter, update);
  }

  async findOne(filter = {}) {
    return this.model.findOne(filter);
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  async findPaginated(filter = {}, sort = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter)
    ]);
    return {
      data,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  }
}

module.exports = BaseRepository;
