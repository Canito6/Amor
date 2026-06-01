export default function WelcomeBanner({ nome, t }) {
  return (
    <div className="glass-panel" style={{ padding: '30px 20px', marginBottom: '30px' }}>
      <h1 style={{ color: 'var(--primary-color)', fontSize: '34px', marginBottom: '8px' }}>
        {t.welcome}, {nome}! ❤️
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
        {t.what_to_do}
      </p>
    </div>
  );
}
