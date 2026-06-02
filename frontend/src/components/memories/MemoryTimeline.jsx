import React from 'react';
import MemoryCard from './MemoryCard';

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
      {memories.map((mem, index) => (
        <MemoryCard
          key={mem._id}
          mem={mem}
          index={index}
          meuNome={meuNome}
          minhaRole={minhaRole}
          editingMemId={editingMemId}
          editMem={editMem}
          setEditMem={setEditMem}
          guardarEdicaoMemoria={guardarEdicaoMemoria}
          cancelarEdicaoMemoria={cancelarEdicaoMemoria}
          formatarDataExtenso={formatarDataExtenso}
          iniciarEdicaoMemoria={iniciarEdicaoMemoria}
          apagarMemoria={apagarMemoria}
          t={t}
        />
      ))}
    </div>
  );
}
