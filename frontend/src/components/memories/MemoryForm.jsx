import React from 'react';

export default function MemoryForm({
  t,
  enviarMemoria,
  title,
  setTitle,
  language,
  date,
  setDate,
  description,
  setDescription,
  isTimeCapsule,
  setIsTimeCapsule,
  unlockDate,
  setUnlockDate,
  imageUrl,
  setImageUrl,
  erro
}) {
  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
      <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>{t.memories_add_title}</h2>
      <form onSubmit={enviarMemoria} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label className="input-label">{t.memories_input_title}</label>
            <input
              type="text"
              placeholder={language === 'pt' ? 'Ex: O nosso primeiro encontro...' : 'E.g., Our first date...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-control"
            />
          </div>
          <div className="form-group">
            <label className="input-label">{t.memories_input_date}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="input-control"
            />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="form-group">
            <label className="input-label">{t.memories_input_desc}</label>
            <textarea
              placeholder={t.memories_desc_placeholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="input-control"
              style={{ resize: 'vertical' }}
              disabled={isTimeCapsule}
            />
          </div>
          <div className="form-group">
            <label className="input-label">Foto URL (Opcional)</label>
            <input
              type="text"
              placeholder={language === 'pt' ? 'Ex: https://exemplo.com/foto.jpg' : 'E.g., https://example.com/photo.jpg'}
              value={imageUrl || ''}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-control"
              style={{ padding: '8px 12px', height: 'fit-content' }}
              disabled={isTimeCapsule}
            />
          </div>
        </div>

        {/* Opções de Cápsula do Tempo */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', marginBottom: '15px', border: '1px solid rgba(114, 9, 183, 0.15)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={isTimeCapsule}
              onChange={(e) => setIsTimeCapsule(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            {t.memories_time_capsule_check}
          </label>
          
          {isTimeCapsule && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="input-label">{t.memories_input_unlock_date}</label>
              <input
                type="date"
                value={unlockDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setUnlockDate(e.target.value)}
                required
                className="input-control"
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
          <button type="submit" className="btn btn-primary">
            {isTimeCapsule ? t.memories_submit_lock : t.memories_submit_normal}
          </button>
        </div>
      </form>
      {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
    </div>
  );
}
