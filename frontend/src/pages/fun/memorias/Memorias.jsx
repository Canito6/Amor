import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import DaysCounter from '../../../components/memories/DaysCounter';
import MemoryForm from '../../../components/memories/MemoryForm';
import MemoryTimeline from '../../../components/memories/MemoryTimeline';
import useMemories from '../../../hooks/fun/useMemories';
import './Memorias.css';

export default function Memorias() {
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const t = translations[language];

  const [viewMode, setViewMode] = useState(() => localStorage.getItem('memory_view_mode') || 'timeline');

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('memory_view_mode', mode);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const {
    memories,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    erro,
    loading,
    contadorDias,
    primeiraData,
    isTimeCapsule,
    setIsTimeCapsule,
    unlockDate,
    setUnlockDate,
    imageUrl,
    setImageUrl,
    editingMemId,
    editMem,
    setEditMem,
    enviarMemoria,
    apagarMemoria,
    iniciarEdicaoMemoria,
    cancelarEdicaoMemoria,
    guardarEdicaoMemoria,
    formatarDataExtenso
  } = useMemories(t, language);

  return (
    <div className="app-container fade-in">
      <div className="page-header-row">
        <button className="btn btn-dark btn-back-memories" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.memories_title}</h1>
        <button className="btn btn-primary btn-export-pdf" onClick={() => window.print()}>
          📖 {language === 'pt' ? 'Exportar Livro' : 'Export Book'}
        </button>
      </div>

      {/* Caixa do Contador de Dias Juntos */}
      <DaysCounter
        t={t}
        primeiraData={primeiraData}
        contadorDias={contadorDias}
        formatarDataExtenso={formatarDataExtenso}
      />

      {/* Alternador de Vista (Grid vs Timeline) */}
      <div className="view-mode-toggle-container" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '25px' }}>
        <button 
          className={`btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-dark'}`}
          onClick={() => handleToggleView('timeline')}
          style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}
        >
          📅 {language === 'pt' ? 'Linha do Tempo' : 'Timeline'}
        </button>
        <button 
          className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-dark'}`}
          onClick={() => handleToggleView('grid')}
          style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}
        >
          🖼️ Grid
        </button>
      </div>

      {/* Formulário para Adicionar Memória */}
      <MemoryForm
        t={t}
        enviarMemoria={enviarMemoria}
        title={title}
        setTitle={setTitle}
        language={language}
        date={date}
        setDate={setDate}
        description={description}
        setDescription={setDescription}
        isTimeCapsule={isTimeCapsule}
        setIsTimeCapsule={setIsTimeCapsule}
        unlockDate={unlockDate}
        setUnlockDate={setUnlockDate}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        erro={erro}
      />

      {/* Linha do Tempo */}
      <MemoryTimeline
        t={t}
        loading={loading}
        memories={memories}
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
        viewMode={viewMode}
      />
    </div>
  );
}
