class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(filter = {}, sort = {}, lean = true) {
    let query = this.model.find(filter).sort(sort);
    if (lean && query && typeof query.lean === 'function') {
      query = query.lean();
    }
    return query;
  }

  async findById(id, lean = false) {
    let query = this.model.findById(id);
    if (lean && query && typeof query.lean === 'function') {
      query = query.lean();
    }
    return query;
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

  async findOne(filter = {}, lean = false) {
    let query = this.model.findOne(filter);
    if (lean && query && typeof query.lean === 'function') {
      query = query.lean();
    }
    return query;
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  async findPaginated(filter = {}, sort = {}, page = 1, limit = 10, lean = true) {
    const skip = (page - 1) * limit;
    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    if (lean && query && typeof query.lean === 'function') {
      query = query.lean();
    }
    const [data, total] = await Promise.all([
      query,
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
