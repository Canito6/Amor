
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
  apagarMemoria,
  viewMode = 'timeline'
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

  const groupMemoriesByMonthYear = (mems) => {
    const groups = {};
    const lang = t.language === 'en' ? 'en' : 'pt';
    
    // Ordenar decrescente para timeline cronológica
    const sorted = [...mems].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sorted.forEach(mem => {
      const d = new Date(mem.date);
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      if (!groups[key]) {
        const monthNamesPt = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const monthNamesEn = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const names = lang === 'en' ? monthNamesEn : monthNamesPt;
        const label = lang === 'en' ? `${names[month]} ${year}` : `${names[month]} de ${year}`;
        
        groups[key] = {
          key,
          label,
          items: []
        };
      }
      groups[key].items.push(mem);
    });
    
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(k => groups[k]);
  };

  if (viewMode === 'grid') {
    return (
      <div className="memory-grid-layout">
        {memories.map((mem, index) => (
          <MemoryCard
            key={mem._id}
            mem={mem}
            index={index}
            viewMode="grid"
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

  const grouped = groupMemoriesByMonthYear(memories);

  return (
    <div className="timeline-grouped-container">
      {grouped.map(group => (
        <div key={group.key} className="timeline-group">
          <div className="timeline-group-header">
            <span className="timeline-group-badge">📅 {group.label}</span>
          </div>
          <div className="timeline">
            {group.items.map((mem, index) => (
              <MemoryCard
                key={mem._id}
                mem={mem}
                index={index}
                viewMode="timeline"
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
        </div>
      ))}
    </div>
  );
}
