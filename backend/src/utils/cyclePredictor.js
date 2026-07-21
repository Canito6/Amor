/**
 * UTILS: cyclePredictor.js
 * 
 * Lógica de previsão de ciclo menstrual, janela fértil e determinação de fases.
 * 
 * FONTE DE VERDADE DE DATAS:
 * Tal como estabelecido no streakCalculator.js, todas as comparações e cálculos de datas
 * utilizam a representação em UTC (start of day UTC) para evitar desvio perto da meia-noite.
 * 
 * AVISO LEGAL:
 * Este é um cálculo estritamente estimado por calendário e histórico do utilizador.
 * NÃO é um método clínico validado nem serve como método contracetivo.
 */

const LEGAL_DISCLAIMER = "As previsões são apenas informativas e não substituem aconselhamento médico nem servem como método contracetivo.";

const PHASE_INSIGHTS = {
  menstrual: "Estás na fase menstrual — é comum sentir maior necessidade de descanso e cuidar de ti.",
  follicular: "Estás na fase folicular — é comum sentir um aumento gradual de energia e boa disposição.",
  ovulation: "Estás na fase de ovulação / janela fértil — é comum sentir mais energia, confiança e motivação nestes dias.",
  luteal: "Estás na fase lútea — é comum sentir mais cansaço ou irritabilidade nestes dias."
};

const PARTNER_INSIGHTS = {
  menstrual: "O teu par está na fase menstrual — gestos de carinho e apoio extra são muito bem-vindos.",
  follicular: "O teu par está na fase folicular — a energia está a subir, um bom momento para planearem atividades juntos.",
  ovulation: "O teu par está na janela fértil / ovulação — ótimo momento para cumplicidade e carinho.",
  luteal: "O teu par pode estar na fase pré-menstrual — pequenos gestos de paciência e carinho podem ajudar."
};

// Helper: Converte qualquer data para a meia-noite UTC (YYYY-MM-DDT00:00:00.000Z)
function toStartOfDayUTC(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// Helper: Diferença em dias entre duas datas UTC
function diffInDaysUTC(d1, d2) {
  const utc1 = toStartOfDayUTC(d1);
  const utc2 = toStartOfDayUTC(d2);
  if (!utc1 || !utc2) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2.getTime() - utc1.getTime()) / msPerDay);
}

// Helper: Adicionar dias em UTC
function addDaysUTC(dateInput, days) {
  const d = toStartOfDayUTC(dateInput);
  if (!d) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/**
 * Calcula o histórico de ciclos e previsões do utilizador.
 * Exige um MÍNIMO DE 2 CICLOS COMPLETOS (pelo menos 2 entradas de início de período)
 * para gerar previsões personalizadas.
 */
function calculateCycleStats(entries = [], referenceDate = new Date()) {
  const todayUTC = toStartOfDayUTC(referenceDate);

  // Filtrar apenas entradas válidas com startDate
  const validEntries = entries
    .filter(e => e && e.startDate)
    .map(e => ({
      ...e,
      startDateUTC: toStartOfDayUTC(e.startDate),
      endDateUTC: e.endDate ? toStartOfDayUTC(e.endDate) : null
    }))
    .sort((a, b) => a.startDateUTC.getTime() - b.startDateUTC.getTime());

  // Se não existirem entradas suficientes para 2 ciclos completos
  if (validEntries.length < 2) {
    return {
      hasEnoughData: false,
      disclaimer: LEGAL_DISCLAIMER,
      totalEntries: validEntries.length,
      currentPhase: null,
      phaseInsight: null,
      partnerInsight: null,
      avgCycleLength: null,
      avgPeriodLength: null,
      nextPeriodStartDate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      ovulationDate: null
    };
  }

  // Calcular durações de ciclos (dias entre startDates consecutivas)
  const cycleLengths = [];
  const periodLengths = [];

  for (let i = 0; i < validEntries.length; i++) {
    const current = validEntries[i];
    
    // Duração do período individual
    if (current.endDateUTC) {
      const pLen = diffInDaysUTC(current.startDateUTC, current.endDateUTC) + 1;
      if (pLen > 0 && pLen <= 15) {
        periodLengths.push(pLen);
      }
    }

    // Duração do ciclo entre entradas consecutivas
    if (i < validEntries.length - 1) {
      const next = validEntries[i + 1];
      const cLen = diffInDaysUTC(current.startDateUTC, next.startDateUTC);
      // Validar durações de ciclo fisiologicamente plausíveis (15 a 60 dias)
      if (cLen >= 15 && cLen <= 60) {
        cycleLengths.push(cLen);
      }
    }
  }

  // Média de duração do ciclo (default 28 se sem amostra válida suficiente)
  const avgCycleLength = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;

  // Média de duração do período (default 5 se sem amostragem)
  const avgPeriodLength = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : 5;

  // Último início de período
  const lastEntry = validEntries[validEntries.length - 1];
  const lastPeriodStart = lastEntry.startDateUTC;

  // Data prevista do próximo período
  const nextPeriodStartDate = addDaysUTC(lastPeriodStart, avgCycleLength);

  // Estimativa do dia de ovulação (Geralmente 14 dias antes do próximo período)
  const ovulationDate = addDaysUTC(nextPeriodStartDate, -14);

  // Estimativa da janela fértil (3 dias antes da ovulação até 3 dias depois)
  const fertileWindowStart = addDaysUTC(ovulationDate, -3);
  const fertileWindowEnd = addDaysUTC(ovulationDate, 3);

  // Dia atual do ciclo (1-indexed a partir de lastPeriodStart)
  const daysSinceLastPeriod = diffInDaysUTC(lastPeriodStart, todayUTC);
  const currentCycleDay = daysSinceLastPeriod >= 0 ? daysSinceLastPeriod + 1 : 1;

  // Verificar se o período está ativo no dia de hoje
  const isPeriodActive = lastEntry.endDateUTC
    ? (todayUTC >= lastPeriodStart && todayUTC <= lastEntry.endDateUTC)
    : (todayUTC >= lastPeriodStart && todayUTC <= addDaysUTC(lastPeriodStart, avgPeriodLength - 1));

  // Determinar a fase atual do ciclo
  let currentPhase = 'follicular';

  if (isPeriodActive) {
    currentPhase = 'menstrual';
  } else if (todayUTC >= fertileWindowStart && todayUTC <= fertileWindowEnd) {
    currentPhase = 'ovulation';
  } else if (todayUTC > fertileWindowEnd && todayUTC < nextPeriodStartDate) {
    currentPhase = 'luteal';
  } else {
    currentPhase = 'follicular';
  }

  return {
    hasEnoughData: true,
    disclaimer: LEGAL_DISCLAIMER,
    totalEntries: validEntries.length,
    currentCycleDay,
    currentPhase,
    isPeriodActive,
    phaseInsight: PHASE_INSIGHTS[currentPhase],
    partnerInsight: PARTNER_INSIGHTS[currentPhase],
    avgCycleLength,
    avgPeriodLength,
    lastPeriodStartDate: lastPeriodStart.toISOString(),
    nextPeriodStartDate: nextPeriodStartDate.toISOString(),
    fertileWindowStart: fertileWindowStart.toISOString(),
    fertileWindowEnd: fertileWindowEnd.toISOString(),
    ovulationDate: ovulationDate.toISOString()
  };
}

module.exports = {
  LEGAL_DISCLAIMER,
  PHASE_INSIGHTS,
  PARTNER_INSIGHTS,
  toStartOfDayUTC,
  diffInDaysUTC,
  addDaysUTC,
  calculateCycleStats
};
