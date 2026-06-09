import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import DaysCounter from '../../components/memories/DaysCounter';
import MemoryForm from '../../components/memories/MemoryForm';
import MemoryTimeline from '../../components/memories/MemoryTimeline';
import useMemories from '../../hooks/useMemories';
import './Memorias.css';

export default function Memorias() {
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const t = translations[language];

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }} className="memories-header-row">
        <button className="btn btn-dark btn-back-memories" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }} className="memories-page-title">{t.memories_title}</h1>
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
      />
    </div>
  );
}
