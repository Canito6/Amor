import React from 'react';

export default function MemoryTimeline({
  t,
  loading,
  memories,
  meuNome,
  minhaRole,
  editingMemId,
  editMem,
  setEditMem,
  guardarEdicaoMemoria,
  cancelarEdicaoMemoria,
  formatarDataExtenso,
  iniciarEdicaoMemoria,
  apagarMemoria
}) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{t.memories_loading}</p>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{t.memories_empty}</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      {memories.map((mem, index) => {
        const isLeft = index % 2 === 0;
        const podeEditar = (mem.createdBy === meuNome || minhaRole === 'admin') && !mem.locked;
        const podeApagar = mem.createdBy === meuNome || minhaRole === 'admin';
        const isEditing = editingMemId === mem._id;
        
        return (
          <div 
            key={mem._id} 
            className={`timeline-item ${isLeft ? 'timeline-left' : 'timeline-right'}`}
          >
            <div className="timeline-card" style={mem.locked ? { border: '1px dashed var(--secondary-color)', background: 'rgba(114, 9, 183, 0.05)' } : {}}>
              
              {/* Modo de Edição Inline */}
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="input-label" style={{ fontSize: '12px' }}>{t.memories_input_title}</label>
                    <input
                      type="text"
                      value={editMem.title}
                      onChange={(e) => setEditMem({...editMem, title: e.target.value})}
                      className="input-control"
                      style={{ fontSize: '14px', padding: '8px 12px' }}
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label" style={{ fontSize: '12px' }}>{t.memories_input_date}</label>
                    <input
                      type="date"
                      value={editMem.date}
                      onChange={(e) => setEditMem({...editMem, date: e.target.value})}
                      className="input-control"
                      style={{ fontSize: '14px', padding: '8px 12px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label" style={{ fontSize: '12px' }}>{t.memories_input_desc}</label>
                    <textarea
                      value={editMem.description}
                      onChange={(e) => setEditMem({...editMem, description: e.target.value})}
                      rows={3}
                      className="input-control"
                      style={{ fontSize: '14px', padding: '8px 12px', resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => guardarEdicaoMemoria(mem._id)}>
                      💾 {t.save}
                    </button>
                    <button className="btn btn-dark" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={cancelarEdicaoMemoria}>
                      ✕ {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="timeline-date">
                    {formatarDataExtenso(mem.date)}
                    {mem.isTimeCapsule && (mem.locked ? t.memories_timeline_locked : t.memories_timeline_unlocked)}
                  </span>
                  <h3 className="timeline-title" style={mem.locked ? { color: 'var(--secondary-color)' } : {}}>{mem.title}</h3>
                  {mem.locked ? (
                    <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '12px', marginTop: '10px', fontSize: '13px', border: '1px solid rgba(114, 9, 183, 0.15)' }}>
                      {t.memories_timeline_unlock_desc.split('{date}')[0]}
                      <strong>{formatarDataExtenso(mem.unlockDate)}</strong>
                      {t.memories_timeline_unlock_desc.split('{date}')[1]}
                    </div>
                  ) : (
                    mem.description && <p className="timeline-desc">{mem.description}</p>
                  )}
                </>
              )}
              
              {!isEditing && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>{t.memories_created_by} <strong>{mem.createdBy}</strong></span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {podeEditar && (
                      <button 
                        onClick={() => iniciarEdicaoMemoria(mem)}
                        style={{ background: 'none', border: 'none', color: 'var(--secondary-color)', cursor: 'pointer', fontSize: '14px', padding: '2px 4px', borderRadius: '4px' }}
                        title={t.edit}
                      >
                        ✏️
                      </button>
                    )}
                    {podeApagar && (
                      <button 
                        onClick={() => apagarMemoria(mem._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '14px', padding: '2px 4px', borderRadius: '4px' }}
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
