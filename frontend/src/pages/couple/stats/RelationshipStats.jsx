import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/auth/authService';
import { usePreferences } from '../../../context/PreferencesContext';
import './RelationshipStats.css';

export default function RelationshipStats() {
  const navigate = useNavigate();
  const { language } = usePreferences();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local translations for stats page
  const localT = {
    pt: {
      title: 'Estatísticas da Relação',
      subtitle: 'O vosso percurso em números e conquistas',
      daysTogether: 'Dias Juntos',
      since: 'Juntos desde',
      streak: 'Dias seguidos',
      moodMatch: 'Sintonia de Humor',
      moodMatchDesc: 'Humor coincidente nos dias em que ambos registaram o vosso estado de espírito.',
      noMoodData: 'Ainda sem dados suficientes para calcular a sintonia.',
      noActivityData: 'Ainda sem dados suficientes para gerar o gráfico de atividade.',
      noActivityDataDesc: 'Comecem a conversar, criar memórias e jogar para verem os vossos dados crescer!',
      activityChart: 'Distribuição de Atividade',
      messages: 'Mensagens',
      memories: 'Memórias',
      photos: 'Fotos',
      scratchCards: 'Raspadinhas',
      coupons: 'Vales',
      quizzes: 'Quizzes',
      wheels: 'Roletas',
      likely: 'Votações',
      totalCapsules: 'Cápsulas do Tempo',
      back: 'Voltar ao Painel',
      scratched: 'reveladas',
      redeemed: 'resgatados',
      completed: 'concluídos',
      matched: 'em sintonia'
    },
    en: {
      title: 'Relationship Stats',
      subtitle: 'Your journey in numbers and achievements',
      daysTogether: 'Days Together',
      since: 'Together since',
      streak: 'Days streak',
      moodMatch: 'Mood Sync Rate',
      moodMatchDesc: 'Matching mood on days when both of you registered your feelings.',
      noMoodData: 'Not enough data to calculate mood sync.',
      noActivityData: 'Not enough data to generate the activity chart.',
      noActivityDataDesc: 'Start chatting, creating memories, and playing to see your stats grow!',
      activityChart: 'Activity Distribution',
      messages: 'Messages',
      memories: 'Memories',
      photos: 'Photos',
      scratchCards: 'Scratch Cards',
      coupons: 'Love Vouchers',
      quizzes: 'Quizzes',
      wheels: 'Decision Wheels',
      likely: 'Who\'s Most Likely',
      totalCapsules: 'Time Capsules',
      back: 'Back to Dashboard',
      scratched: 'scratched',
      redeemed: 'redeemed',
      completed: 'completed',
      matched: 'matched'
    },
    es: {
      title: 'Estadísticas de la Relación',
      subtitle: 'Vuestro camino en números y logros',
      daysTogether: 'Días Juntos',
      since: 'Juntos desde',
      streak: 'Días seguidos',
      moodMatch: 'Sintonía de Humor',
      moodMatchDesc: 'Humor coincidente en los días en que ambos registraron vuestro estado de ánimo.',
      noMoodData: 'Aún no hay datos suficientes para calcular la sintonía.',
      noActivityData: 'Aún no hay datos suficientes para generar el gráfico de actividad.',
      noActivityDataDesc: '¡Comenzad a conversar, crear recuerdos y jugar para ver vuestros datos crecer!',
      activityChart: 'Distribución de Actividad',
      messages: 'Mensajes',
      memories: 'Recuerdos',
      photos: 'Fotos',
      scratchCards: 'Rasca y Gana',
      coupons: 'Vales de Amor',
      quizzes: 'Cuestionarios',
      wheels: 'Ruletas',
      likely: 'Votaciones',
      totalCapsules: 'Cápsulas del Tiempo',
      back: 'Volver al Panel',
      scratched: 'reveladas',
      redeemed: 'canjeados',
      completed: 'completados',
      matched: 'en sintonía'
    }
  };

  const currentT = localT[language] || localT['pt'];

  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await authService.getCoupleStats();
        setStats(data);

        // Fetch AI Insight
        try {
          const parsed = await authService.getAiInsights();
          if (parsed && parsed.insight) setAiInsight(parsed.insight);
        } catch {
          // Ignorar falha secundária da IA
        }
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
        setError(language === 'en' ? 'Failed to load stats.' : 'Erro ao carregar estatísticas.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [language]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="glass-panel error-panel" style={{ padding: '30px', margin: '20px auto', maxWidth: '500px' }}>
          <h2>⚠️ {error}</h2>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/dashboard')}>
            {currentT.back}
          </button>
        </div>
      </div>
    );
  }

  // Check if data is completely empty (new couple)
  const isDataEmpty = !stats || (
    (stats.messagesCount || 0) === 0 &&
    (stats.memoriesCount || 0) === 0 &&
    (stats.photosCount || 0) === 0 &&
    (stats.scratchCards?.total || 0) === 0 &&
    (stats.quizzes?.total || 0) === 0 &&
    (stats.decisionWheelsCount || 0) === 0
  );

  const formattedStartDate = stats?.relationshipDate ? new Date(stats.relationshipDate).toLocaleDateString(
    language === 'en' ? 'en-US' : (language === 'es' ? 'es-ES' : 'pt-PT'),
    { year: 'numeric', month: 'long', day: 'numeric' }
  ) : null;

  // Prepared data for custom SVG Bar Chart
  const chartData = stats ? [
    { label: currentT.messages, val: stats.messagesCount || 0, color: '#ff4d6d' },
    { label: currentT.memories, val: stats.memoriesCount || 0, color: '#9b5de5' },
    { label: currentT.photos, val: stats.photosCount || 0, color: '#f15bb5' },
    { label: currentT.scratchCards, val: stats.scratchCards?.total || 0, color: '#fee440' },
    { label: currentT.quizzes, val: stats.quizzes?.total || 0, color: '#00f5d4' },
    { label: currentT.wheels, val: stats.decisionWheelsCount || 0, color: '#00bbf9' }
  ] : [];

  const maxVal = Math.max(...chartData.map(d => d.val), 5); // Fallback to 5 to avoid division by 0

  return (
    <div className="app-container stats-page-container fade-in">
      <div className="stats-header">
        <h1 className="stats-main-title">📊 {currentT.title}</h1>
        <p className="stats-subtitle">{currentT.subtitle}</p>
      </div>

      {aiInsight && (
        <div className="glass-panel slide-down" style={{ padding: '1.2rem 1.5rem', marginBottom: '20px', borderRadius: '16px', border: '1px solid rgba(255, 77, 109, 0.3)', background: 'linear-gradient(135deg, rgba(255, 77, 109, 0.08) 0%, rgba(155, 93, 229, 0.08) 100%)', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff4d6d', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
            ✨ AI Love Insight da Semana ✨
          </div>
          <p style={{ fontSize: '15px', fontStyle: 'italic', color: 'var(--text-primary)', margin: 0 }}>
            "{aiInsight}"
          </p>
        </div>
      )}

      {/* Love counter top widget */}
      {stats?.relationshipDate && (
        <div className="glass-panel love-counter-summary-card">
          <div className="love-counter-icon">❤️</div>
          <div className="love-counter-details">
            <h2>{stats.totalDaysTogether} {currentT.daysTogether}</h2>
            <p>{currentT.since} {formattedStartDate} ✨</p>
          </div>
          {stats.currentStreak > 0 && (
            <div className="stats-streak-badge">
              🔥 {stats.currentStreak} {currentT.streak}
            </div>
          )}
        </div>
      )}

      <div className="stats-bento-grid">
        {/* Mood match gauge card */}
        <div className="glass-panel bento-card mood-match-card">
          <h3>🧠 {currentT.moodMatch}</h3>
          {stats?.moodMatchPercentage !== null && stats?.moodMatchPercentage !== undefined ? (
            <div className="mood-gauge-wrapper">
              <svg viewBox="0 0 100 100" width="120" height="120">
                <circle cx="50" cy="50" r="42" className="gauge-bg" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="gauge-progress"
                  style={{
                    strokeDasharray: 264,
                    strokeDashoffset: 264 - (264 * stats.moodMatchPercentage) / 100
                  }}
                />
                <text x="50" y="55" className="gauge-text">{stats.moodMatchPercentage}%</text>
              </svg>
              <p className="mood-match-description">{currentT.moodMatchDesc}</p>
            </div>
          ) : (
            <div className="no-data-placeholder">
              <span className="placeholder-icon">🤍</span>
              <p>{currentT.noMoodData}</p>
            </div>
          )}
        </div>

        {/* Totals cards */}
        <div className="glass-panel bento-card numeric-totals-card">
          <div className="totals-subgrid">
            <div className="total-item">
              <span className="total-icon">💬</span>
              <div>
                <h4>{stats?.messagesCount || 0}</h4>
                <p>{currentT.messages}</p>
              </div>
            </div>
            <div className="total-item">
              <span className="total-icon">⏳</span>
              <div>
                <h4>{stats?.memoriesCount || 0}</h4>
                <p>{currentT.memories}</p>
              </div>
            </div>
            <div className="total-item">
              <span className="total-icon">📸</span>
              <div>
                <h4>{stats?.photosCount || 0}</h4>
                <p>{currentT.photos}</p>
              </div>
            </div>
            <div className="total-item">
              <span className="total-icon">🎡</span>
              <div>
                <h4>{stats?.decisionWheelsCount || 0}</h4>
                <p>{currentT.wheels}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quizzes and likely questions matched */}
        <div className="glass-panel bento-card detailed-activities-card">
          <div className="activity-row">
            <div className="activity-info">
              <span>🎮 {currentT.quizzes}</span>
              <p>{stats?.quizzes?.completed || 0} / {stats?.quizzes?.total || 0} {currentT.completed}</p>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${stats?.quizzes?.total > 0 ? (stats.quizzes.completed / stats.quizzes.total) * 100 : 0}%`,
                  backgroundColor: '#00f5d4' 
                }} 
              />
            </div>
          </div>

          <div className="activity-row">
            <div className="activity-info">
              <span>🎯 {currentT.likely}</span>
              <p>{stats?.likely?.matched || 0} / {stats?.likely?.total || 0} {currentT.matched}</p>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${stats?.likely?.total > 0 ? (stats.likely.matched / stats.likely.total) * 100 : 0}%`,
                  backgroundColor: '#ff4d6d' 
                }} 
              />
            </div>
          </div>

          <div className="activity-row">
            <div className="activity-info">
              <span>🎰 {currentT.scratchCards}</span>
              <p>{stats?.scratchCards?.scratched || 0} / {stats?.scratchCards?.total || 0} {currentT.scratched}</p>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${stats?.scratchCards?.total > 0 ? (stats.scratchCards.scratched / stats.scratchCards.total) * 100 : 0}%`,
                  backgroundColor: '#fee440' 
                }} 
              />
            </div>
          </div>
        </div>

        {/* Chart card */}
        <div className="glass-panel bento-card chart-card-large">
          <h3>📈 {currentT.activityChart}</h3>
          {isDataEmpty ? (
            <div className="no-data-placeholder">
              <span className="placeholder-icon">📊</span>
              <p className="no-data-main">{currentT.noActivityData}</p>
              <p className="no-data-sub">{currentT.noActivityDataDesc}</p>
            </div>
          ) : (
            <div className="custom-chart-wrapper">
              <div className="custom-bars-container">
                {chartData.map((bar, idx) => {
                  const barHeightPct = Math.max((bar.val / maxVal) * 80, bar.val > 0 ? 8 : 0);
                  return (
                    <div key={idx} className="chart-bar-column">
                      <div className="chart-bar-value-bubble">{bar.val}</div>
                      <div className="chart-bar-outer">
                        <div 
                          className="chart-bar-inner" 
                          style={{ 
                            height: `${barHeightPct}%`, 
                            backgroundColor: bar.color,
                            boxShadow: `0 0 10px ${bar.color}80` 
                          }}
                        />
                      </div>
                      <span className="chart-bar-label">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {currentT.back}
        </button>
      </div>
    </div>
  );
}
