const Tab = require('../models/Tab');
const BaseController = require('./baseController');
const ApiError = require('../utils/apiError');

class TabController extends BaseController {
  constructor() {
    super(Tab, 'Aba');
  }

  getTabs = async (req, res, next) => {
    // Sort by order ascending
    await this.getAllItems(req, res, next, {}, { order: 1 });
  };

  createTab = async (req, res, next) => {
    try {
      const { title, icon, accentColor, bgGradient, contentType, content, order } = req.body;
      if (!title) {
        throw new ApiError(400, 'O título da aba é obrigatório.');
      }

      await this.createItem(req, res, next, {
        title,
        icon: icon || '❤️',
        accentColor: accentColor || '#ff4d6d',
        bgGradient: bgGradient || 'linear-gradient(135deg, #ffccd5, #ffcad4)',
        contentType: contentType || 'notes',
        content: content || '',
        order: order || 0
      });
    } catch (error) {
      next(this.handleError(error));
    }
  };

  updateTab = async (req, res, next) => {
    try {
      const { title, icon, accentColor, bgGradient, contentType, content, order } = req.body;
      const tab = await this.model.findOne({ _id: req.params.id, coupleId: req.coupleId });
      
      if (!tab) {
        throw new ApiError(404, 'Aba não encontrada ou sem permissão.');
      }
      
      if (title !== undefined) tab.title = title;
      if (icon !== undefined) tab.icon = icon;
      if (accentColor !== undefined) tab.accentColor = accentColor;
      if (bgGradient !== undefined) tab.bgGradient = bgGradient;
      if (contentType !== undefined) tab.contentType = contentType;
      if (content !== undefined) tab.content = content;
      if (order !== undefined) tab.order = order;
      
      await tab.save();
      res.json(tab);
    } catch (error) {
      next(this.handleError(error));
    }
  };

  deleteTab = async (req, res, next) => {
    try {
      const tab = await this.model.findOneAndDelete({ _id: req.params.id, coupleId: req.coupleId });
      if (!tab) {
        throw new ApiError(404, 'Aba não encontrada ou sem permissão.');
      }
      res.json({ message: 'Aba eliminada com sucesso.' });
    } catch (error) {
      next(this.handleError(error));
    }
  };
}

module.exports = new TabController();
