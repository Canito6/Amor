import React from 'react';
import PolaroidFrame from '../shared/PolaroidFrame';

export default function MemoryCard({
  mem,
  index,
  meuNome,
  minhaRole,
  editingMemId,
  editMem,
  setEditMem,
  guardarEdicaoMemoria,
  cancelarEdicaoMemoria,
  iniciarEdicaoMemoria,
  apagarMemoria,
  formatarDataExtenso,
  viewMode = 'timeline',
  t
}) {
  const isLeft = index % 2 === 0;
  const podeEditar = (mem.createdBy === meuNome || minhaRole === 'admin') && !mem.locked;
  const podeApagar = mem.createdBy === meuNome || minhaRole === 'admin';
  const isEditing = editingMemId === mem._id;

  const innerContent = (
    <PolaroidFrame
      imageUrl={isEditing ? editMem.imageUrl : mem.imageUrl}
      title={isEditing ? '' : mem.title}
      date={isEditing ? '' : formatarDataExtenso(mem.date)}
      id={mem._id}
    >
      {/* Modo de Edição Inline */}
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <div className="form-group">
            <label className="input-label" style={{ fontSize: '12px', textAlign: 'left' }}>{t.memories_input_title}</label>
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
            <label className="input-label" style={{ fontSize: '12px', textAlign: 'left' }}>{t.memories_input_date}</label>
            <input
              type="date"
              value={editMem.date}
              onChange={(e) => setEditMem({...editMem, date: e.target.value})}
              className="input-control"
              style={{ fontSize: '14px', padding: '8px 12px' }}
            />
          </div>
          <div className="form-group">
            <label className="input-label" style={{ fontSize: '12px', textAlign: 'left' }}>Foto URL (Opcional)</label>
            <input
              type="text"
              placeholder="https://exemplo.com/foto.jpg"
              value={editMem.imageUrl || ''}
              onChange={(e) => setEditMem({...editMem, imageUrl: e.target.value})}
              className="input-control"
              style={{ fontSize: '14px', padding: '8px 12px' }}
            />
          </div>
          <div className="form-group">
            <label className="input-label" style={{ fontSize: '12px', textAlign: 'left' }}>{t.memories_input_desc}</label>
            <textarea
              value={editMem.description}
              onChange={(e) => setEditMem({...editMem, description: e.target.value})}
              rows={3}
              className="input-control"
              style={{ fontSize: '14px', padding: '8px 12px', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '5px' }}>
            <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={() => guardarEdicaoMemoria(mem._id)}>
              💾 {t.save}
            </button>
            <button className="btn btn-dark" style={{ padding: '6px 16px', fontSize: '13px' }} onClick={cancelarEdicaoMemoria}>
              ✕ {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {mem.isTimeCapsule && (
            <div style={{ fontSize: '11px', color: 'var(--secondary-color)', fontWeight: 'bold', margin: '4px 0', textAlign: 'center' }}>
              {mem.locked ? t.memories_timeline_locked : t.memories_timeline_unlocked}
            </div>
          )}
          
          {mem.locked ? (
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '12px', marginTop: '10px', fontSize: '13.5px', border: '1px solid rgba(114, 9, 183, 0.15)', color: 'var(--text-muted)' }}>
              {t.memories_timeline_unlock_desc.split('{date}')[0]}
              <strong>{formatarDataExtenso(mem.unlockDate)}</strong>
              {t.memories_timeline_unlock_desc.split('{date}')[1]}
            </div>
          ) : (
            mem.description && <p className="timeline-desc" style={{ marginTop: '8px', textAlign: 'left', fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{mem.description}</p>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px dashed rgba(0,0,0,0.08)', fontSize: '11px', color: 'var(--text-muted)' }}>
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
        </div>
      )}
    </PolaroidFrame>
  );

  if (viewMode === 'grid') {
    return (
      <div 
        className="memory-grid-card-wrapper"
        style={{ 
          opacity: mem.locked ? 0.75 : 1,
          transition: 'opacity 0.3s ease'
        }}
      >
        {innerContent}
      </div>
    );
  }

  // Vista Timeline (Alternada esquerda/direita com marcadores)
  return (
    <div className={`timeline-item ${isLeft ? 'timeline-left' : 'timeline-right'}`}>
      <div className="timeline-connector-dot">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="white">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div 
        className="timeline-card-polaroid-wrapper"
        style={mem.locked ? { opacity: 0.75 } : {}}
      >
        {innerContent}
      </div>
    </div>
  );
}
