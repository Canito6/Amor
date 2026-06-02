import { formatDateLong } from '../../utils/dateFormatter';

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
        padding: '20px 25px', 
        marginBottom: '30px', 
        border: '2px dashed var(--primary-color)', 
        background: 'rgba(255, 77, 109, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span style={{ fontSize: '24px' }}>{t.countdown}</span>
      <h2 style={{ fontSize: '18px', color: 'var(--text-main)', margin: 0 }}>
        {t.next_event}: <strong style={{ color: 'var(--primary-color)' }}>{nextEvent.title}</strong>
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
        {formatarDataExtenso(nextEvent.date)}
      </p>
      <span 
        style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: 'var(--secondary-color)',
          background: 'white',
          padding: '6px 16px',
          borderRadius: '12px',
          marginTop: '5px',
          border: '1px solid rgba(114, 9, 183, 0.15)'
        }}
      >
        {formatarDiasRestantes(daysRemaining)}
      </span>
    </div>
  );
}
