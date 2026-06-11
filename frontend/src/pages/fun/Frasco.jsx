import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jarService } from '../../services/fun/jarService';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { translations } from '../../services/common/translations';
import JarBottle from '../../components/frasco/JarBottle';
import NoteCreator from '../../components/frasco/NoteCreator';
import NoteUnfolder from '../../components/frasco/NoteUnfolder';
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
    } catch (e) {
      // Audio context might be blocked initially by browser autoplay policy
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
    } catch (err) {
      setError(t.jar_error_load || 'Erro ao carregar o frasco.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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
    } catch (err) {
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
    } catch (err) {
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
      <div className="jar-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="jar-page-title">{t.jar_title || 'Frasco dos Mimos 🏺'}</h1>
        <div style={{ width: '100px' }} className="header-spacer"></div>
      </div>

      <p className="jar-subtitle">{t.jar_subtitle || 'Escrevam pequenos bilhetes carinhosos um para o outro'}</p>

      {error && (
        <div className="jar-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Main Interactive Area */}
      <div className="jar-workspace">
        <div className="jar-bottle-stage">
          {/* O FRASCO VIRTUAL */}
          <JarBottle
            notes={notes}
            isShaking={isShaking}
            language={language}
            onDraw={handleDrawNote}
          />

          <div className="jar-action-buttons">
            <button 
              className="btn btn-primary btn-shake-jar" 
              onClick={handleDrawNote}
              disabled={isShaking || notes.length === 0}
            >
              {isShaking ? '...' : (t.jar_shake_btn || 'Agitar e Tirar!')}
            </button>
            
            <button 
              className="btn btn-dark btn-write-jar" 
              onClick={() => setShowCreator(true)}
              disabled={isShaking}
            >
              ✍️ {language === 'pt' ? 'Colocar Papelinho' : 'Add Note'}
            </button>
          </div>

          {drawingError && (
            <p className="jar-drawing-error">{drawingError}</p>
          )}
        </div>
      </div>

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

      {/* History panel (only for deleting / checking own list) */}
      {loading ? (
        <div className="jar-history-container glass-panel fade-in">
          <h3>📜 {language === 'pt' ? 'A carregar papelinhos...' : 'Loading Placed Notes...'}</h3>
          <div className="jar-history-list">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="jar-history-item skeleton" style={{ height: '70px', borderRadius: '16px', border: 'none' }} />
            ))}
          </div>
        </div>
      ) : notes.length > 0 && (
        <div className="jar-history-container glass-panel fade-in">
          <h3>📜 {language === 'pt' ? 'Papelinhos Colocados' : 'Placed Notes'}</h3>
          <div className="jar-history-list">
            {notes.map(note => (
              <div key={note._id} className="jar-history-item">
                <span className="history-cat-icon">{getCategoryIcon(note.category)}</span>
                <div className="history-text">
                  <p className="history-message">"{note.content}"</p>
                  <span className="history-meta">
                    {language === 'pt' ? 'Por' : 'By'}: {note.createdBy}
                  </span>
                </div>
                {(note.createdBy === meuNome || minhaRole === 'admin') && (
                  <button 
                    className="history-delete-btn"
                    onClick={(e) => handleDeleteNote(e, note._id)}
                    title={t.jar_confirm_delete}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>

          {currentPage < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <button
                className="btn btn-dark"
                onClick={() => carregarNotas(currentPage + 1, true)}
                disabled={loadingMore}
                style={{ padding: '10px 24px', fontSize: '14px', opacity: loadingMore ? 0.7 : 1 }}
              >
                {loadingMore ? '⏳ A carregar...' : (language === 'pt' ? 'Carregar Mais' : 'Load More')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
