import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { letterService } from '../../../services/fun/letterService';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import LetterCard from '../../../components/cartas/LetterCard';
import LetterCreator from '../../../components/cartas/LetterCreator';
import LetterReader from '../../../components/cartas/LetterReader';
import './Cartas.css';

export default function Cartas() {
  const [letters, setLetters] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'locked' | 'unlocked' | 'opened'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Creator modal visibility state
  const [showCreator, setShowCreator] = useState(false);
  const [creating, setCreating] = useState(false);

  // Active opened letter (modal lightbox view)
  const [readingLetter, setReadingLetter] = useState(null);
  const [openingId, setOpeningId] = useState(null); // Para animação de quebra de selo

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome') || '';
  const minhaRole = localStorage.getItem('role') || '';
  
  const { language } = usePreferences();
  const t = translations[language];

  // Obter o humor atual do utilizador local
  const [meuHumor, setMeuHumor] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarCartas();
    const userMood = localStorage.getItem('userMood') || '';
    setMeuHumor(userMood);
  }, [navigate]);

  const carregarCartas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await letterService.getLetters();
      setLetters(data);
    } catch (err) {
      setError(t.letter_error_load || 'Erro ao carregar as cartas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLetter = async (title, content, type, value) => {
    try {
      setCreating(true);
      setError('');
      const newLetter = await letterService.createLetter({
        title: title.trim(),
        content: content.trim(),
        conditionType: type,
        conditionValue: value.toString()
      });
      setLetters([newLetter, ...letters]);
      setShowCreator(false);
      alert(t.letter_success_created || 'Carta surpresa enviada!');
    } catch (err) {
      setError(t.letter_error_save || 'Erro ao enviar carta.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenLetter = async (letter) => {
    if (letter.isOpened) {
      setReadingLetter(letter);
      return;
    }

    try {
      setError('');
      setOpeningId(letter._id);

      // Aguarda 1s para a animação de quebra do selo
      setTimeout(async () => {
        try {
          const opened = await letterService.openLetter(letter._id);
          setLetters(letters.map(l => l._id === letter._id ? opened : l));
          setReadingLetter(opened);
        } catch (err) {
          setError(err.message || t.letter_error_open || 'Erro ao abrir carta. Condições não cumpridas!');
        } finally {
          setOpeningId(null);
        }
      }, 1000);

    } catch (err) {
      setOpeningId(null);
      setError(t.letter_error_open || 'Erro ao abrir carta.');
    }
  };

  const handleDeleteLetter = async (e, id) => {
    e.stopPropagation();
    const confirmMsg = t.letter_confirm_delete || 'Tens a certeza que queres eliminar esta carta?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');
      await letterService.deleteLetter(id);
      setLetters(letters.filter(l => l._id !== id));
      if (readingLetter && readingLetter._id === id) {
        setReadingLetter(null);
      }
    } catch (err) {
      setError(t.letter_error_delete || 'Erro ao eliminar carta.');
    }
  };

  const checkIsLocked = (letter) => {
    if (letter.isOpened) return false;
    const isCreator = letter.createdBy === meuNome;
    if (isCreator) return false;

    if (letter.conditionType === 'date') {
      const now = new Date();
      const targetDate = new Date(letter.conditionValue);
      return now < targetDate;
    } else if (letter.conditionType === 'mood') {
      return meuHumor !== letter.conditionValue;
    }
    return false;
  };

  const filteredLetters = letters.filter(letter => {
    const isLocked = checkIsLocked(letter);
    if (filter === 'locked') return isLocked;
    if (filter === 'unlocked') return !isLocked && !letter.isOpened && letter.createdBy !== meuNome;
    if (filter === 'opened') return letter.isOpened;
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.letter_title || "Cartas 'Abrir Quando...' ✉️"}</h1>
        <div className="page-header-spacer"></div>
      </div>

      <p className="letter-subtitle">{t.letter_subtitle || 'Mensagens surpresa para ler em momentos específicos'}</p>

      {error && (
        <div className="letter-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Control Panel */}
      <div className="letter-controls-bar">
        <div className="letter-filters glass-panel">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t.coupon_filter_all || 'Todos'} ({letters.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unlocked' ? 'active' : ''}`}
            onClick={() => setFilter('unlocked')}
            title="Cartas prontas a abrir escritas pelo parceiro"
          >
            {language === 'pt' ? 'Prontas a Abrir' : 'Ready to Open'} ({letters.filter(l => !checkIsLocked(l) && !l.isOpened && l.createdBy !== meuNome).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
            onClick={() => setFilter('locked')}
            title="Cartas com regras de abertura pendentes"
          >
            {language === 'pt' ? 'Bloqueadas' : 'Locked'} ({letters.filter(l => checkIsLocked(l)).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'opened' ? 'active' : ''}`}
            onClick={() => setFilter('opened')}
          >
            {t.letter_status_opened ? t.letter_status_opened.split(' ')[0] : 'Abertas'} ({letters.filter(l => l.isOpened).length})
          </button>
        </div>

        <button 
          className="btn btn-primary btn-add-letter" 
          onClick={() => setShowCreator(true)}
          disabled={loading}
        >
          ➕ {t.letter_create_title || 'Escrever Carta'}
        </button>
      </div>

      {/* Creator Drawer/Modal */}
      {showCreator && (
        <LetterCreator
          onClose={() => setShowCreator(false)}
          onSubmit={handleCreateLetter}
          creating={creating}
          language={language}
          t={t}
        />
      )}

      {/* Letters List */}
      {loading ? (
        <div className="letter-loading-spinner-container">
          <div className="spinner"></div>
        </div>
      ) : filteredLetters.length === 0 ? (
        <div className="glass-panel empty-letter-state">
          <p>{t.letter_empty_state || 'Nenhuma carta surpresa encontrada.'}</p>
        </div>
      ) : (
        <div className="letter-grid fade-in">
          {filteredLetters.map(letter => (
            <LetterCard
              key={letter._id}
              letter={letter}
              meuNome={meuNome}
              minhaRole={minhaRole}
              isLocked={checkIsLocked(letter)}
              isOpening={openingId === letter._id}
              onOpen={handleOpenLetter}
              onDelete={handleDeleteLetter}
              formatDate={formatDate}
              language={language}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Reader Modal Lightbox */}
      {readingLetter && (
        <LetterReader
          letter={readingLetter}
          onClose={() => setReadingLetter(null)}
          formatDate={formatDate}
          language={language}
          t={t}
        />
      )}
    </div>
  );
}
