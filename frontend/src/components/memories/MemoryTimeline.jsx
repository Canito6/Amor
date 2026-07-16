import React from 'react';
import MemoryCard from './MemoryCard';
import Skeleton from '../shared/Skeleton';

import EmptyState from '../shared/EmptyState';

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
      <div className="memory-timeline-skeletons" style={{ padding: '10px 0' }}>
        <Skeleton variant="card" height="140px" style={{ marginBottom: '20px' }} />
        <Skeleton variant="card" height="140px" style={{ marginBottom: '20px' }} />
        <Skeleton variant="card" height="140px" style={{ marginBottom: '20px' }} />
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <EmptyState
        icon="📖"
        title={t.memories_empty || "Sem memórias ainda"}
        description={t.language === 'en' ? "Add your first couple memory in the form above!" : "Adicionem a vossa primeira memória em casal no formulário acima!"}
      />
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
