const JarNote = require('../models/JarNote');
const BaseController = require('./baseController');
const jarService = require('../services/jarService');

class JarController extends BaseController {
  constructor() {
    super(JarNote, 'Papelinho');
  }

  getJarNotes = async (req, res, next) => {
    await this.getAllItems(req, res, next);
  };

  getRandomJarNote = async (req, res, next) => {
    try {
      const note = await jarService.getRandomJarNote(req.coupleId, req.user.username);
      res.json(note);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  createJarNote = async (req, res, next) => {
    await this.createItem(req, res, next);
  };

  deleteJarNote = async (req, res, next) => {
    await this.deleteItem(req, res, next);
  };
}

module.exports = new JarController();
