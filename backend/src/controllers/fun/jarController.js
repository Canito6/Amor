const BaseController = require('../baseController');

class JarController extends BaseController {
  constructor(jarService, jarRepository) {
    super(jarRepository, 'Papelinho');
    this.jarService = jarService;
  }

  getJarNotes = async (req, res, next) => {
    await this.getAllItems(req, res, next);
  };

  getRandomJarNote = async (req, res, next) => {
    try {
      const note = await this.jarService.getRandomJarNote(req.coupleId, req.user.username);
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

  generateAI = async (req, res, next) => {
    try {
      const geminiService = require('../../services/ai/geminiService');
      const category = req.body?.category || 'amor';
      const jarNote = await geminiService.generateJarNote({ category });
      res.json(jarNote);
    } catch (error) {
      next(this.handleError(error));
    }
  };
}

module.exports = JarController;
