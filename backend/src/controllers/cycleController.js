const CycleService = require('../services/cycleService');

class CycleController {
  constructor(cycleService) {
    this.cycleService = cycleService || new CycleService();

    // Bind methods to instance for express routes
    this.getEntries = this.getEntries.bind(this);
    this.createOrUpdateEntry = this.createOrUpdateEntry.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.deleteAllEntries = this.deleteAllEntries.bind(this);
    this.getSummary = this.getSummary.bind(this);
    this.updatePreferences = this.updatePreferences.bind(this);
    this.getPartnerSummary = this.getPartnerSummary.bind(this);
  }

  async getEntries(req, res, next) {
    try {
      const entries = await this.cycleService.getEntries(req.user.id);
      res.json(entries);
    } catch (error) {
      next(error);
    }
  }

  async createOrUpdateEntry(req, res, next) {
    try {
      const entry = await this.cycleService.createOrUpdateEntry(req.user.id, req.body);
      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  }

  async deleteEntry(req, res, next) {
    try {
      await this.cycleService.deleteEntry(req.user.id, req.params.id);
      res.json({ message: 'Registo de ciclo apagado com sucesso.' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAllEntries(req, res, next) {
    try {
      await this.cycleService.deleteAllEntries(req.user.id);
      res.json({ message: 'Todo o histórico de ciclo foi apagado com sucesso.' });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const summary = await this.cycleService.getSummary(req.user.id);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const preferences = await this.cycleService.updatePreferences(req.user.id, req.body);
      res.json({ message: 'Preferências atualizadas com sucesso.', preferences });
    } catch (error) {
      next(error);
    }
  }

  async getPartnerSummary(req, res, next) {
    try {
      const partnerSummary = await this.cycleService.getPartnerSummary(req.user.id);
      res.json(partnerSummary);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CycleController;
