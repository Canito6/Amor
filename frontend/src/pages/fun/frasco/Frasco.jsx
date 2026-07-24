import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jarService } from '../../../services/fun/jarService';
import { usePreferences } from '../../../context/PreferencesContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { translations } from '../../../services/common/translations';
import NoteCreator from '../../../components/frasco/NoteCreator';
import NoteUnfolder from '../../../components/frasco/NoteUnfolder';
import JarWorkspace from '../../../components/frasco/JarWorkspace';
import JarHistoryList from '../../../components/frasco/JarHistoryList';
import { triggerMagicSparkles } from '../../../utils/confettiUtils';
import './Frasco.css';

export default function Frasco() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form states (creating new note)
  const [showCreator, setShowCreator] = useState(false);
  const [creating, setCreating] = useState(false);

  // Drawing state
  const [drawnNote, setDrawnNote] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [drawingError, setDrawingError] = useState('');

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome') || '';
  const minhaRole = localStorage.getItem('role') || '';
  
  const { language } = usePreferences();
  const t = translations[language];

  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Synthesized glass clinking sound (Web Audio API)
  const playClinkSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio context might be blocked initially by browser autoplay policy
    }
  };

  const carregarNotas = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');
      const data = await jarService.getJarNotes(page, 10);
      
      // Tratar resposta paginada ou array legado
      if (data && data.data) {
        const novasNotas = data.data || [];
        if (append) {
          setNotes(prev => [...prev, ...novasNotas]);
        } else {
          setNotes(novasNotas);
        }
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.pages || 1);
      } else {
        setNotes(data || []);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch {
      setError(t.jar_error_load || 'Erro ao carregar o frasco.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarNotas();
  }, [navigate]);

  const handleCreateNote = async (content, category) => {
    try {
      setCreating(true);
      setError('');
      const newNote = await jarService.createJarNote({
        content,
        category
      });
      setNotes([newNote, ...notes]);
      setShowCreator(false);
      showToast(t.jar_success_created || 'Papelinho colocado no frasco! 🎉', 'success');
    } catch {
      setError(t.jar_error_save || 'Erro ao guardar papelinho.');
    } finally {
      setCreating(false);
    }
  };

  const handleDrawNote = async () => {
    if (isShaking) return;
    setIsShaking(true);
    setDrawnNote(null);
    setDrawingError('');

    // Efeito sonoro
    playClinkSound();

    // Simular abanar do frasco por 1.2 segundos
    setTimeout(async () => {
      try {
        const drawn = await jarService.getRandomJarNote();
        setDrawnNote(drawn);
        triggerMagicSparkles();
      } catch (err) {
        setDrawingError(err.message || t.jar_error_draw || 'O frasco está vazio!');
      } finally {
        setIsShaking(false);
      }
    }, 1200);
  };

  const handleDeleteNote = async (e, id) => {
    e.stopPropagation();
    const confirmMsg = t.jar_confirm_delete || 'Tens a certeza que queres eliminar este papelinho?';
    
    const accepted = await confirm({
      title: language === 'pt' ? 'Eliminar Papelinho 🗑️' : 'Delete Note 🗑️',
      message: confirmMsg,
      confirmText: language === 'pt' ? 'Eliminar' : 'Delete',
      cancelText: language === 'pt' ? 'Cancelar' : 'Cancel'
    });
    if (!accepted) return;

    try {
      setError('');
      await jarService.deleteJarNote(id);
      setNotes(notes.filter(n => n._id !== id));
      if (drawnNote && drawnNote._id === id) {
        setDrawnNote(null);
      }
      showToast(language === 'pt' ? 'Papelinho eliminado com sucesso!' : 'Note deleted successfully!', 'success');
    } catch {
      setError(t.jar_error_delete || 'Erro ao eliminar papelinho.');
    }
  };

  const getCategoryIcon = (cat) => {
    if (cat === 'miminho') return '💖';
    if (cat === 'piada') return '🤫';
    if (cat === 'recordacao') return '⏳';
    return '📝';
  };

  const getCategoryLabel = (cat) => {
    if (cat === 'miminho') return t.jar_cat_miminho || 'Miminho';
    if (cat === 'piada') return t.jar_cat_piada || 'Piada';
    if (cat === 'recordacao') return t.jar_cat_recordacao || 'Recordação';
    return 'Mensagem';
  };

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.jar_title || 'Frasco dos Mimos 🏺'}</h1>
        <div className="page-header-spacer"></div>
      </div>

      <p className="jar-subtitle">{t.jar_subtitle || 'Escrevam pequenos bilhetes carinhosos um para o outro'}</p>

      {error && (
        <div className="jar-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Main Interactive Area */}
      <JarWorkspace 
        notes={notes}
        isShaking={isShaking}
        language={language}
        handleDrawNote={handleDrawNote}
        drawingError={drawingError}
        setShowCreator={setShowCreator}
        t={t}
      />

      {/* Write Note Modal */}
      {showCreator && (
        <NoteCreator
          onClose={() => setShowCreator(false)}
          onSubmit={handleCreateNote}
          creating={creating}
          t={t}
        />
      )}

      {/* Drawn Note Lightbox Modal */}
      {drawnNote && (
        <NoteUnfolder
          note={drawnNote}
          onClose={() => setDrawnNote(null)}
          getCategoryIcon={getCategoryIcon}
          getCategoryLabel={getCategoryLabel}
          language={language}
          t={t}
        />
      )}

      {/* History panel */}
      <JarHistoryList 
        loading={loading}
        notes={notes}
        getCategoryIcon={getCategoryIcon}
        meuNome={meuNome}
        minhaRole={minhaRole}
        handleDeleteNote={handleDeleteNote}
        currentPage={currentPage}
        totalPages={totalPages}
        carregarNotas={carregarNotas}
        loadingMore={loadingMore}
        language={language}
        t={t}
      />
    </div>
  );
}
