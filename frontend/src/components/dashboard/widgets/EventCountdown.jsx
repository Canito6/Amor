import { formatDateLong } from '../../../utils/formatting/dateFormatter';

export default function EventCountdown({ nextEvent, daysRemaining, language, t }) {
  if (!nextEvent) return null;

  const formatarDataExtenso = (dataStr) => {
    return formatDateLong(dataStr, language === 'pt' ? 'pt' : 'en');
  };

  const formatarDiasRestantes = (dias) => {
    if (dias === 0) return t.days_remaining_today;
    if (dias === 1) return t.days_remaining_one;
    return t.days_remaining_many.replace('{count}', dias);
  };

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
        fontSize: '18px', 
        color: 'var(--text-main)', 
        margin: 0, 
        fontWeight: '700' 
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
      <span className="countdown-badge">
        {formatarDiasRestantes(daysRemaining)}
      </span>
    </div>
  );
}
