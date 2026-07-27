import { formatDateLong } from '../../../utils/formatting/dateFormatter';

export default function EventCountdown({ nextEvent, daysRemaining, language, t }) {
  if (!nextEvent) {
    return (
      <div 
        className="countdown-widget" 
        style={{ 
          padding: '24px 20px', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxSizing: 'border-box',
          textAlign: 'center'
        }}
      >
        <span style={{ fontSize: '32px', opacity: 0.85 }}>⏳</span>
        <h3 style={{ 
          fontFamily: 'var(--font-title)', 
          fontSize: '16px', 
          color: 'var(--text-main)', 
          margin: 0, 
          fontWeight: '600' 
        }}>
          {t?.no_upcoming_events || (language === 'pt' ? 'Sem contagem decrescente' : 'No active countdown')}
        </h3>
        <p style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: '13px', 
          color: 'var(--text-muted)', 
          margin: 0,
          maxWidth: '240px',
          lineHeight: '1.4'
        }}>
          {t?.no_upcoming_events_desc || (language === 'pt' ? 'Adicionem um evento no Calendário para verem a contagem decrescente aqui! ❤️' : 'Add an event in the Calendar to see the countdown here! ❤️')}
        </p>
      </div>
    );
  }

  const formatarDataExtenso = (dataStr) => {
    return formatDateLong(dataStr, language === 'pt' ? 'pt' : 'en');
  };

  const formatarDiasRestantes = (dias) => {
    if (dias === 0) return t.days_remaining_today;
    if (dias === 1) return t.days_remaining_one;
    return t.days_remaining_many.replace('{count}', dias);
  };

  // Cálculo da percentagem de tempo decorrido
  const dateTarget = new Date(nextEvent.date);
  dateTarget.setHours(0, 0, 0, 0);
  const dateCreated = nextEvent.createdAt ? new Date(nextEvent.createdAt) : null;
  const totalDays = dateCreated 
    ? Math.max(Math.ceil((dateTarget.getTime() - dateCreated.getTime()) / (1000 * 60 * 60 * 24)), 1)
    : 30;
  const elapsedDays = Math.max(totalDays - daysRemaining, 0);
  const percent = Math.min((elapsedDays / totalDays) * 100, 100);

  // Mapeamento de categorias de eventos para classes CSS
  const category = (nextEvent.category || nextEvent.type || 'outro').toLowerCase().replace(/\s+/g, '-');
  const badgeClass = `countdown-badge badge-${category}`;

  return (
    <div 
      className="countdown-widget" 
      style={{ 
        padding: '30px 20px', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxSizing: 'border-box'
      }}
    >
      <span style={{ fontSize: '32px' }}>📅</span>
      <h3 style={{ 
        fontFamily: 'var(--font-title)', 
        fontSize: '17px', 
        color: 'var(--text-main)', 
        margin: 0, 
        fontWeight: '700',
        wordBreak: 'break-word',
        textAlign: 'center',
        maxWidth: '100%'
      }}>
        {t.next_event}: <span style={{ color: 'var(--primary-color)' }}>{nextEvent.title}</span>
      </h3>
      <p style={{ 
        fontFamily: 'var(--font-body)', 
        fontSize: '13.5px', 
        color: 'var(--text-muted)', 
        margin: 0 
      }}>
        {formatarDataExtenso(nextEvent.date)}
      </p>
      
      <span className={badgeClass}>
        {formatarDiasRestantes(daysRemaining)}
      </span>

      {/* Barra de Progresso do Evento */}
      <div className="event-progress-container">
        <div 
          className="event-progress-bar"
          style={{
            width: `${percent}%`,
            background: 'var(--main-gradient)',
            height: '100%',
            borderRadius: '10px',
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
}
