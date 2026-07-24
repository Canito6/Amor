import { useEffect, useState } from 'react';
import { cycleService } from '../../../services/cycle/cycleService';

export default function PartnerCycleWidget() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    cycleService.getPartnerSummary()
      .then(res => {
        if (isMounted) {
          setSummary(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSummary({ enabled: false });
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  if (loading || !summary || !summary.enabled) {
    return null;
  }

  const { partnerName, currentPhase, isPeriodActive, partnerInsight, level, latestSymptoms } = summary;

  const phaseNames = {
    menstrual: 'Fase Menstrual 🌸',
    follicular: 'Fase Folicular 🌱',
    ovulation: 'Janela Fértil / Ovulação ✨',
    luteal: 'Fase Lútea 🌙'
  };

  return (
    <div
      className="dashboard-widget-card"
      style={{
        background: 'var(--card-bg, rgba(255, 255, 255, 0.85))',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--card-border, rgba(255, 255, 255, 0.3))',
        borderRadius: 'var(--radius-lg, 20px)',
        padding: '18px 20px',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm, 0 4px 6px -1px rgba(0, 0, 0, 0.05))'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', fontFamily: 'var(--font-title)' }}>
          🌸 Apoio ao Par ({partnerName || 'Parceiro'})
        </h4>
        <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', background: 'var(--input-bg, #f1f5f9)', color: 'var(--text-muted, #475569)', fontWeight: '600' }}>
          {phaseNames[currentPhase] || 'Ciclo'}
        </span>
      </div>

      <p style={{ margin: '0 0 10px 0', fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
        {partnerInsight || 'Apoia o teu par com gestos de carinho.'}
      </p>

      {isPeriodActive && (
        <div style={{ fontSize: '0.82rem', color: '#e11d48', fontWeight: '600', marginBottom: '8px' }}>
          🩸 O teu par está atualmente no período menstrual.
        </div>
      )}

      {level === 'detailed' && Array.isArray(latestSymptoms) && latestSymptoms.length > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {latestSymptoms.map(sym => (
            <span
              key={sym}
              style={{
                fontSize: '0.78rem',
                padding: '3px 8px',
                borderRadius: '10px',
                background: 'var(--input-bg, #f8fafc)',
                border: '1px solid var(--card-border, #e2e8f0)',
                color: 'var(--text-muted, #64748b)'
              }}
            >
              {sym.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
