import React, { useState, useEffect } from 'react';
import { cycleService } from '../../services/cycle/cycleService';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/shared/EmptyState';
import './CycleCalendar.css';

const SYMPTOM_CATEGORIES = {
  fisicos: [
    { id: 'colicas', label: 'Cólicas ⚡' },
    { id: 'dor_cabeca', label: 'Dor de Cabeça 🤕' },
    { id: 'sensibilidade_seios', label: 'Sensibilidade nos Seios 🌸' },
    { id: 'inchaco', label: 'Inchaço 🎈' },
    { id: 'acne', label: 'Acne ✨' },
    { id: 'dores_costas', label: 'Dores nas Costas 🪵' },
    { id: 'nauseas', label: 'Náuseas 🤢' },
    { id: 'tonturas', label: 'Tonturas 💫' }
  ],
  energia_sono: [
    { id: 'cansaco', label: 'Cansaço 🥱' },
    { id: 'insonia', label: 'Insónia 🌙' },
    { id: 'energia_elevada', label: 'Energia Elevada ⚡' }
  ],
  humor: [
    { id: 'irritabilidade', label: 'Irritabilidade 😠' },
    { id: 'ansiedade', label: 'Ansiedade 😰' },
    { id: 'tristeza', label: 'Tristeza 😢' },
    { id: 'motivacao', label: 'Motivação 🔥' },
    { id: 'calma', label: 'Calma 🧘' }
  ],
  outros: [
    { id: 'alteracoes_apetite', label: 'Alterações de Apetite 🍕' },
    { id: 'corrimento', label: 'Corrimento 💧' }
  ]
};

const MOOD_OPTIONS = ['😀', '🙂', '😐', '😔', '😠', '😴', '🥰'];

export default function CycleCalendar() {
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'log' | 'settings'
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [preferences, setPreferences] = useState({
    shareWithPartner: false,
    partnerShareLevel: 'basic',
    hiddenFromMenu: false,
    remindersEnabled: true
  });

  // Calendar State
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);

  // Log Form State
  const [isPeriodActive, setIsPeriodActive] = useState(false);
  const [flowIntensity, setFlowIntensity] = useState('moderado');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [sexualActivity, setSexualActivity] = useState(false);
  const [notes, setNotes] = useState('');

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, entData] = await Promise.all([
        cycleService.getSummary(),
        cycleService.getEntries()
      ]);
      setSummary(sumData);
      setEntries(entData);
      if (sumData.preferences) {
        setPreferences(sumData.preferences);
      }
    } catch (err) {
      showToast(err.message || 'Erro ao carregar dados do ciclo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync Log Form when selected date changes
  useEffect(() => {
    const existing = entries.find(e => {
      const eDateStr = new Date(e.startDate).toISOString().split('T')[0];
      return eDateStr === selectedDateStr;
    });

    if (existing) {
      setIsPeriodActive(true);
      setFlowIntensity(existing.flowIntensity || 'moderado');
      setSelectedSymptoms(existing.symptoms || []);
      setSelectedMood(existing.mood || '');
      setSexualActivity(Boolean(existing.sexualActivity));
      setNotes(existing.notes || '');
    } else {
      setIsPeriodActive(false);
      setFlowIntensity('moderado');
      setSelectedSymptoms([]);
      setSelectedMood('');
      setSexualActivity(false);
      setNotes('');
    }
  }, [selectedDateStr, entries]);

  const handleSaveLog = async (e) => {
    e.preventDefault();
    try {
      await cycleService.createOrUpdateEntry({
        startDate: selectedDateStr,
        flowIntensity: isPeriodActive ? flowIntensity : null,
        symptoms: selectedSymptoms,
        mood: selectedMood,
        sexualActivity,
        notes
      });
      showToast('Registo do dia guardado com sucesso! 💖', 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Erro ao guardar registo.', 'error');
    }
  };

  const handleUpdatePreferences = async (newPrefs) => {
    try {
      const updated = await cycleService.updatePreferences(newPrefs);
      setPreferences(updated.preferences || updated);
      showToast('Preferências de privacidade atualizadas!', 'success');
    } catch (err) {
      showToast(err.message || 'Erro ao atualizar preferências.', 'error');
    }
  };

  const handleDeleteAllHistory = async () => {
    try {
      await cycleService.deleteAllEntries();
      setShowDeleteModal(false);
      showToast('Todo o histórico de ciclo foi eliminado.', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Erro ao eliminar histórico.', 'error');
    }
  };

  const toggleSymptom = (symId) => {
    setSelectedSymptoms(prev =>
      prev.includes(symId) ? prev.filter(s => s !== symId) : [...prev, symId]
    );
  };

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push({ isPadding: true });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(Date.UTC(year, month, d));
    const dateStr = dateObj.toISOString().split('T')[0];

    // Check period, fertile, ovulation
    const isPeriodDay = entries.some(e => {
      const s = new Date(e.startDate).toISOString().split('T')[0];
      const end = e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : s;
      return dateStr >= s && dateStr <= end;
    });

    let isFertile = false;
    let isOvulation = false;

    if (summary && summary.stats && summary.stats.hasEnoughData) {
      const fertStart = summary.stats.fertileWindowStart ? summary.stats.fertileWindowStart.split('T')[0] : null;
      const fertEnd = summary.stats.fertileWindowEnd ? summary.stats.fertileWindowEnd.split('T')[0] : null;
      const ovuDate = summary.stats.ovulationDate ? summary.stats.ovulationDate.split('T')[0] : null;

      if (fertStart && fertEnd && dateStr >= fertStart && dateStr <= fertEnd) {
        isFertile = true;
      }
      if (ovuDate && dateStr === ovuDate) {
        isOvulation = true;
      }
    }

    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    calendarDays.push({
      dayNumber: d,
      dateStr,
      isPeriodDay,
      isFertile,
      isOvulation,
      isToday
    });
  }

  const stats = summary?.stats || {};
  const currentPhase = stats.currentPhase || 'follicular';

  const phaseNames = {
    menstrual: 'Fase Menstrual 🌸',
    follicular: 'Fase Folicular 🌱',
    ovulation: 'Janela Fértil / Ovulação ✨',
    luteal: 'Fase Lútea 🌙'
  };

  return (
    <div className="cycle-page-container">
      {/* Aviso Legal Visível Obrigatório */}
      <div className="legal-notice-bar" role="note">
        <span>⚠️</span>
        <div>
          <strong>Aviso Informativo:</strong> {stats.disclaimer || "As previsões são apenas informativas e não substituem aconselhamento médico nem servem como método contracetivo."}
        </div>
      </div>

      {/* Header Card */}
      <div className="cycle-header-card">
        <div className="cycle-header-top">
          <h1 className="cycle-title">
            <span>🌸</span> Calendário Menstrual
          </h1>

          {stats.hasEnoughData && (
            <span className={`phase-badge ${currentPhase}`}>
              {phaseNames[currentPhase] || 'Em Acompanhamento'}
            </span>
          )}
        </div>

        {stats.hasEnoughData ? (
          <div>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.05rem', fontWeight: '600' }}>
              Dia {stats.currentCycleDay} do teu ciclo (duração média: {stats.avgCycleLength} dias)
            </p>
            {stats.phaseInsight && (
              <div className="insight-box">
                💡 <strong>Insight do Dia:</strong> {stats.phaseInsight}
              </div>
            )}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Regista pelo menos 2 ciclos para desbloquear previsões personalizadas da tua janela fértil e próximo período.
          </p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="cycle-tabs">
        <button
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendário
        </button>
        <button
          className={`tab-button ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          ✏️ Registo Diário ({selectedDateStr})
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Definições & Privacidade
        </button>
      </div>

      {/* TAB 1: CALENDÁRIO */}
      {activeTab === 'calendar' && (
        <div className="calendar-card">
          {entries.length === 0 && !loading && (
            <EmptyState
              icon="🌸"
              title="Sem registos de ciclo ainda"
              description="Começa por registar a data do teu primeiro período para ver o teu calendário colorido e previsões."
            />
          )}

          <div className="calendar-month-header">
            <button
              className="month-nav-btn"
              onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
              aria-label="Mês Anterior"
            >
              ◄
            </button>
            <h2 className="calendar-month-title">
              {currentMonthDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              className="month-nav-btn"
              onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
              aria-label="Próximo Mês"
            >
              ►
            </button>
          </div>

          <div className="calendar-grid-header">
            <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
          </div>

          <div className="calendar-grid">
            {calendarDays.map((cell, idx) => {
              if (cell.isPadding) {
                return <div key={`pad-${idx}`} className="calendar-day-cell other-month" />;
              }

              const isSelected = cell.dateStr === selectedDateStr;
              let classNames = 'calendar-day-cell';
              if (cell.isPeriodDay) classNames += ' period';
              if (cell.isFertile) classNames += ' fertile';
              if (cell.isOvulation) classNames += ' ovulation';
              if (cell.isToday) classNames += ' today';
              if (isSelected) classNames += ' selected';

              return (
                <button
                  key={cell.dateStr}
                  className={classNames}
                  onClick={() => {
                    setSelectedDateStr(cell.dateStr);
                    setActiveTab('log');
                  }}
                  title={cell.dateStr}
                >
                  <span>{cell.dayNumber}</span>
                  {cell.isOvulation && <span style={{ fontSize: '10px' }}>⭐</span>}
                </button>
              );
            })}
          </div>

          <div className="legend-bar">
            <div className="legend-item">
              <span className="legend-dot period" />
              <span>Dias de Período</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot fertile" />
              <span>Janela Fértil Estimada</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot ovulation" />
              <span>Dia de Ovulação Estimado</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTO DIÁRIO */}
      {activeTab === 'log' && (
        <div className="log-form-card">
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', fontFamily: 'var(--font-title)' }}>
            Registo para o dia: {selectedDateStr}
          </h2>

          <form onSubmit={handleSaveLog}>
            {/* Período Toggle */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                🩸 Período Ativo?
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className={`tag-btn ${isPeriodActive ? 'active' : ''}`}
                  onClick={() => setIsPeriodActive(true)}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className={`tag-btn ${!isPeriodActive ? 'active' : ''}`}
                  onClick={() => setIsPeriodActive(false)}
                >
                  Não
                </button>
              </div>
            </div>

            {/* Intensidade de Fluxo */}
            {isPeriodActive && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  Intensidade do Fluxo
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'leve', label: 'Leve' },
                    { id: 'moderado', label: 'Moderado' },
                    { id: 'intenso', label: 'Intenso' },
                    { id: 'muito_intenso', label: 'Muito Intenso' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      className={`tag-btn ${flowIntensity === f.id ? 'active' : ''}`}
                      onClick={() => setFlowIntensity(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sintomas Categorizados */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                🩺 Sintomas do Dia
              </label>

              <div className="symptom-category-title">Físicos</div>
              <div className="symptoms-tags-group">
                {SYMPTOM_CATEGORIES.fisicos.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`tag-btn ${selectedSymptoms.includes(s.id) ? 'active' : ''}`}
                    onClick={() => toggleSymptom(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="symptom-category-title">Energia & Sono</div>
              <div className="symptoms-tags-group">
                {SYMPTOM_CATEGORIES.energia_sono.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`tag-btn ${selectedSymptoms.includes(s.id) ? 'active' : ''}`}
                    onClick={() => toggleSymptom(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="symptom-category-title">Humor</div>
              <div className="symptoms-tags-group">
                {SYMPTOM_CATEGORIES.humor.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`tag-btn ${selectedSymptoms.includes(s.id) ? 'active' : ''}`}
                    onClick={() => toggleSymptom(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="symptom-category-title">Outros</div>
              <div className="symptoms-tags-group">
                {SYMPTOM_CATEGORIES.outros.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`tag-btn ${selectedSymptoms.includes(s.id) ? 'active' : ''}`}
                    onClick={() => toggleSymptom(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Humor Emoji */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                😊 Estado de Ânimo / Humor
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {MOOD_OPTIONS.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`tag-btn ${selectedMood === m ? 'active' : ''}`}
                    style={{ fontSize: '1.2rem', padding: '6px 12px' }}
                    onClick={() => setSelectedMood(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Atividade Sexual */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                id="sexual-activity-check"
                type="checkbox"
                checked={sexualActivity}
                onChange={e => setSexualActivity(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <label htmlFor="sexual-activity-check" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
                💞 Registar atividade sexual neste dia
              </label>
            </div>

            {/* Notas */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                📝 Notas Pessoais (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Escreve aqui apontamentos pessoais sobre como te sentes hoje..."
                className="input-control"
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              💾 Guardar Registo do Dia
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: DEFINIÇÕES & PRIVACIDADE */}
      {activeTab === 'settings' && (
        <div className="log-form-card">
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', fontFamily: 'var(--font-title)' }}>
            🔒 Privacidade & Definições do Ciclo
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label htmlFor="share-partner-toggle" style={{ fontWeight: '600', cursor: 'pointer' }}>
                💖 Modo Parceiro (Partilhar visão resumida com o parceiro)
              </label>
              <input
                id="share-partner-toggle"
                type="checkbox"
                checked={preferences.shareWithPartner}
                onChange={e => handleUpdatePreferences({ shareWithPartner: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', lineHeight: '1.4' }}>
              Quando ativo, o teu parceiro vê um widget discreto no Dashboard dele com sugestões de apoio.
            </small>
          </div>

          {preferences.shareWithPartner && (
            <div style={{ marginBottom: '24px', paddingLeft: '16px', borderLeft: '3px solid var(--primary-color)' }}>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Nível de Detalhe Visível para o Parceiro
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="partnerShareLevel"
                    value="basic"
                    checked={preferences.partnerShareLevel === 'basic'}
                    onChange={() => handleUpdatePreferences({ partnerShareLevel: 'basic' })}
                  />
                  <span><strong>Básico (Recomendado):</strong> Apenas fase atual, se o período está ativo e a próxima data prevista.</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="partnerShareLevel"
                    value="detailed"
                    checked={preferences.partnerShareLevel === 'detailed'}
                    onChange={() => handleUpdatePreferences({ partnerShareLevel: 'detailed' })}
                  />
                  <span><strong>Detalhado:</strong> Também mostra sintomas e humor do dia registado.</span>
                </label>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label htmlFor="reminders-toggle" style={{ fontWeight: '600', cursor: 'pointer' }}>
                🔔 Lembretes Push de Ciclo
              </label>
              <input
                id="reminders-toggle"
                type="checkbox"
                checked={preferences.remindersEnabled}
                onChange={e => handleUpdatePreferences({ remindersEnabled: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', lineHeight: '1.4' }}>
              Recebe avisos discretos no telemóvel antes da data prevista. A notificação no ecrã bloqueado é sempre genérica e neutra por privacidade.
            </small>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--card-border)' }}>
            <h3 style={{ fontSize: '1rem', color: '#e11d48', margin: '0 0 8px 0' }}>
              ⚠️ Zona de Perigo
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Apaga permanentemente todas as tuas entradas e histórico de ciclo.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: '#e11d48', borderColor: '#fecdd3' }}
              onClick={() => setShowDeleteModal(true)}
            >
              🗑️ Apagar Todo o Histórico de Ciclo
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ margin: '0 0 12px 0', color: '#e11d48' }}>
              Tens a certeza?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Esta ação é irreversível. Todas as tuas entradas de período, sintomas e notas de ciclo serão apagadas permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ backgroundColor: '#e11d48' }}
                onClick={handleDeleteAllHistory}
              >
                Sim, Apagar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
