const User = require('../models/auth/userModel');
const CycleRepository = require('../repositories/cycleRepository');
const { calculateCycleStats, toStartOfDayUTC } = require('../utils/cyclePredictor');
const ApiError = require('../utils/apiError');

class CycleService {
  constructor(cycleRepository) {
    this.cycleRepository = cycleRepository || new CycleRepository();
  }

  async getEntries(userId) {
    return this.cycleRepository.find({ userId }, { startDate: 1 });
  }

  async createOrUpdateEntry(userId, data) {
    const { id, startDate, endDate, flowIntensity, symptoms, mood, sexualActivity, notes } = data;

    if (!startDate) {
      throw new ApiError(400, 'A data de início do registo é obrigatória.');
    }

    const startUTC = toStartOfDayUTC(startDate);
    const endUTC = endDate ? toStartOfDayUTC(endDate) : null;

    const maxFuture = new Date();
    maxFuture.setFullYear(maxFuture.getFullYear() + 1);

    if (startUTC > maxFuture) {
      throw new ApiError(400, 'A data de início não pode estar a mais de 1 ano no futuro.');
    }

    if (endUTC) {
      if (endUTC > maxFuture) {
        throw new ApiError(400, 'A data de fim não pode estar a mais de 1 ano no futuro.');
      }
      if (endUTC < startUTC) {
        throw new ApiError(400, 'A data de fim não pode ser anterior à data de início.');
      }
    }

    let entry = null;

    if (id) {
      entry = await this.cycleRepository.findById(id);
      if (!entry || entry.userId.toString() !== userId.toString()) {
        throw new ApiError(404, 'Registo de ciclo não encontrado.');
      }
    } else {
      // Procurar registo existente com a mesma startDate em UTC para evitar duplicados
      entry = await this.cycleRepository.findOne({ userId, startDate: startUTC });
    }

    const updatePayload = {
      userId,
      startDate: startUTC,
      endDate: endUTC,
      flowIntensity: flowIntensity || null,
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      mood: mood || '',
      sexualActivity: Boolean(sexualActivity),
      notes: notes || ''
    };

    if (entry) {
      return this.cycleRepository.findByIdAndUpdate(entry._id, updatePayload, { new: true });
    }

    return this.cycleRepository.create(updatePayload);
  }

  async deleteEntry(userId, entryId) {
    const entry = await this.cycleRepository.findById(entryId);
    if (!entry) {
      throw new ApiError(404, 'Registo de ciclo não encontrado.');
    }
    if (entry.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Não tens permissão para eliminar este registo.');
    }
    return this.cycleRepository.findByIdAndDelete(entryId);
  }

  async deleteAllEntries(userId) {
    return this.cycleRepository.deleteAllForUser(userId);
  }

  async getSummary(userId) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'Utilizador não encontrado.');

    const entries = await this.getEntries(userId);
    const stats = calculateCycleStats(entries);

    const userPrefs = user.cycleTracking || {
      shareWithPartner: false,
      partnerShareLevel: 'basic',
      hiddenFromMenu: false,
      remindersEnabled: true
    };

    return {
      stats,
      preferences: userPrefs,
      recentEntries: entries.slice(-10)
    };
  }

  async getPartnerSummary(currentUserId) {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser || !currentUser.coupleId) {
      return { enabled: false };
    }

    // Encontrar parceiro do mesmo casal
    const partnerUser = await User.findOne({
      coupleId: currentUser.coupleId,
      _id: { $ne: currentUser._id }
    });

    if (!partnerUser) {
      return { enabled: false };
    }

    const partnerPrefs = partnerUser.cycleTracking || {};

    // Revogação Imediata: Se partilha desativada ou nível 'none', devolver resposta neutra imediata
    if (!partnerPrefs.shareWithPartner || partnerPrefs.partnerShareLevel === 'none') {
      return { enabled: false };
    }

    const partnerEntries = await this.getEntries(partnerUser._id);
    const stats = calculateCycleStats(partnerEntries);

    const level = partnerPrefs.partnerShareLevel || 'basic';

    const baseSummary = {
      enabled: true,
      partnerName: partnerUser.username,
      level,
      currentPhase: stats.currentPhase,
      isPeriodActive: stats.isPeriodActive,
      nextPeriodStartDate: stats.nextPeriodStartDate,
      partnerInsight: stats.partnerInsight,
      hasEnoughData: stats.hasEnoughData,
      disclaimer: stats.disclaimer
    };

    if (level === 'detailed') {
      const latestEntry = partnerEntries.length > 0 ? partnerEntries[partnerEntries.length - 1] : null;
      baseSummary.latestSymptoms = latestEntry ? latestEntry.symptoms : [];
      baseSummary.latestMood = latestEntry ? latestEntry.mood : '';
    }

    return baseSummary;
  }

  async updatePreferences(userId, prefs = {}) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'Utilizador não encontrado.');

    if (!user.cycleTracking) {
      user.cycleTracking = {};
    }

    if (typeof prefs.shareWithPartner === 'boolean') {
      user.cycleTracking.shareWithPartner = prefs.shareWithPartner;
    }
    if (['none', 'basic', 'detailed'].includes(prefs.partnerShareLevel)) {
      user.cycleTracking.partnerShareLevel = prefs.partnerShareLevel;
    }
    if (typeof prefs.hiddenFromMenu === 'boolean') {
      user.cycleTracking.hiddenFromMenu = prefs.hiddenFromMenu;
    }
    if (typeof prefs.remindersEnabled === 'boolean') {
      user.cycleTracking.remindersEnabled = prefs.remindersEnabled;
    }

    user.markModified('cycleTracking');
    await user.save();

    return user.cycleTracking;
  }
}

module.exports = CycleService;
