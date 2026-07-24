

export default function DaysCounter({
  t,
  primeiraData,
  contadorDias,
  formatarDataExtenso
}) {
  if (!primeiraData) return null;

  return (
    <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginBottom: '40px', border: '2px solid var(--primary-color)' }}>
      <h2 style={{ fontSize: '24px', color: 'var(--primary-color)', marginBottom: '8px' }}>
        {t.memories_counter_title}
      </h2>
      <p style={{ fontSize: '18px', margin: '10px 0' }}>
        {t.memories_counter_body.split('{count}')[0]}
        <strong style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>{contadorDias}</strong>
        {t.memories_counter_body.split('{count}')[1]}
      </p>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        {t.memories_counter_footer.replace('{date}', formatarDataExtenso(primeiraData))}
      </span>
    </div>
  );
}
