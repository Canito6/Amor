const User = require('../../models/auth/userModel');
const CycleEntry = require('../../models/cycle/cycleEntryModel');
const pushService = require('../common/pushService');
const { calculateCycleStats, toStartOfDayUTC, diffInDaysUTC } = require('../../utils/cyclePredictor');

/**
 * Worker de Verificação Periódica de Lembretes de Ciclo.
 * 
 * REQUISITO DE PRIVACIDADE CRÍTICO:
 * O texto da notificação deve ser SEMPRE GENÉRICO E NEUTRO no ecrã de bloqueio,
 * NUNCA mencionando "período", "ciclo" ou termos de saúde diretamente.
 */

const NEUTRAL_TITLE = 'Calendário Amor 💜';
const NEUTRAL_BODY = 'Tens uma atualização no teu Calendário Amor 💜';

const checkCycleReminders = async () => {
  try {
    const usersWithReminders = await User.find({
      'cycleTracking.remindersEnabled': true
    });

    if (!usersWithReminders || usersWithReminders.length === 0) return;

    const todayUTC = toStartOfDayUTC(new Date());

    for (const user of usersWithReminders) {
      const entries = await CycleEntry.find({ userId: user._id }).sort({ startDate: 1 });
      const stats = calculateCycleStats(entries, todayUTC);

      if (!stats.hasEnoughData || !stats.nextPeriodStartDate) continue;

      const nextStartUTC = toStartOfDayUTC(stats.nextPeriodStartDate);
      const daysUntilNext = diffInDaysUTC(todayUTC, nextStartUTC);

      // Disparar aviso 2 dias antes do período previsto ou no próprio dia
      if (daysUntilNext === 2 || daysUntilNext === 0) {
        await pushService.sendPushNotification(user._id, NEUTRAL_TITLE, NEUTRAL_BODY, '/ciclo');
      }
    }
  } catch (error) {
    console.error('❌ Erro no worker de lembretes de ciclo:', error);
  }
};

const startCycleReminderWorker = () => {
  if (process.env.NODE_ENV === 'test') return;

  // Executar no arranque
  checkCycleReminders();

  // Executar periodicamente a cada 12 horas
  setInterval(checkCycleReminders, 12 * 60 * 60 * 1000);
};

module.exports = {
  checkCycleReminders,
  startCycleReminderWorker,
  NEUTRAL_TITLE,
  NEUTRAL_BODY
};
