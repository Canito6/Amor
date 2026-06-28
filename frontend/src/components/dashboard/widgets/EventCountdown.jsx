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
      className="glass-panel" 
      style={{ 
        padding: '25px 20px', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(114, 9, 183, 0.08) 0%, rgba(255, 77, 109, 0.08) 100%)',
        border: '1px solid rgba(114, 9, 183, 0.15)',
        gap: '10px'
      }}
    >
      <span style={{ fontSize: '28px' }}>📅</span>
      <h3 style={{ fontSize: '18px', color: 'var(--text-main)', margin: 0, fontWeight: '700' }}>
        {t.next_event}: <span style={{ color: 'var(--primary-color)' }}>{nextEvent.title}</span>
      </h3>
      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
        {formatarDataExtenso(nextEvent.date)}
      </p>
      <span 
        style={{ 
          fontSize: '14px', 
          fontWeight: '700', 
          color: 'var(--secondary-color)',
          background: 'rgba(114, 9, 183, 0.1)',
          padding: '6px 14px',
          borderRadius: '20px',
          marginTop: '4px',
          border: '1px solid rgba(114, 9, 183, 0.15)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {formatarDiasRestantes(daysRemaining)}
      </span>
    </div>
  );
}
