import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scratchCardService } from '../../services/fun/scratchCardService';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import ScratchLightbox from '../../components/raspadinhas/ScratchLightbox';
import ScratchCardCreator from '../../components/raspadinhas/ScratchCardCreator';
import ScratchCardItem from '../../components/raspadinhas/ScratchCardItem';
import './Raspadinhas.css';

export default function Raspadinhas() {
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'scratched', 'created'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form toggle state
  const [showCreator, setShowCreator] = useState(false);

  // Scratching overlay modal state
  const [scratchingCard, setScratchingCard] = useState(null);

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome') || '';
  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarRaspadinhas();
  }, [navigate]);

  const carregarRaspadinhas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await scratchCardService.getScratchCards();
      setCards(data);
    } catch (err) {
      setError(t.scratch_error_load || 'Erro ao carregar raspadinhas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCardSubmit = async (title, reward) => {
    try {
      setError('');
      const newCard = await scratchCardService.createScratchCard({ title, reward });
      setCards([newCard, ...cards]);
      alert(t.scratch_success_created || 'Raspadinha criada!');
    } catch (err) {
      setError(t.scratch_error_save || 'Erro ao guardar raspadinha.');
      throw err; // throw to propagate to the form state
    }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm(t.scratch_confirm_delete || 'Tens a certeza?')) return;
    try {
      setError('');
      await scratchCardService.deleteScratchCard(id);
      setCards(cards.filter(c => c._id !== id));
      if (scratchingCard && scratchingCard._id === id) {
        setScratchingCard(null);
      }
    } catch (err) {
      setError(t.scratch_error_delete || 'Erro ao eliminar.');
    }
  };

  const handleMarkAsScratched = async (id) => {
    try {
      const updated = await scratchCardService.scratchCard(id);
      setCards(cards.map(c => c._id === id ? updated : c));
      // Se a raspadinha estiver aberta em modal, atualiza
      if (scratchingCard && scratchingCard._id === id) {
        setScratchingCard(updated);
      }
    } catch (err) {
      console.error('Erro ao marcar como raspada:', err);
    }
  };

  // Categorize cards
  const pendingCards = cards.filter(c => c.createdBy !== meuNome && !c.isScratched);
  const scratchedCards = cards.filter(c => c.createdBy !== meuNome && c.isScratched);
  const createdCards = cards.filter(c => c.createdBy === meuNome);

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="scratch-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="scratch-page-title">{t.scratch_title}</h1>
        <div style={{ width: '100px' }} className="header-spacer"></div>
      </div>

      <p className="scratch-subtitle">{t.scratch_subtitle}</p>

      {error && (
        <div className="scratch-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Action Buttons & Creator Form */}
      <div className="scratch-action-container">
        {!showCreator ? (
          <button className="btn btn-primary" onClick={() => setShowCreator(true)}>
            🎁 {t.scratch_create_title}
          </button>
        ) : (
          <ScratchCardCreator
            onSubmit={handleCreateCardSubmit}
            onClose={() => setShowCreator(false)}
            t={t}
          />
        )}
      </div>

      {/* Tabs */}
      <div className="scratch-tabs-container">
        <button
          className={`scratch-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          {t.scratch_tab_pending.replace('{count}', pendingCards.length)}
        </button>
        <button
          className={`scratch-tab-btn ${activeTab === 'scratched' ? 'active' : ''}`}
          onClick={() => setActiveTab('scratched')}
        >
          {t.scratch_tab_scratched.replace('{count}', scratchedCards.length)}
        </button>
        <button
          className={`scratch-tab-btn ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          {t.scratch_tab_created.replace('{count}', createdCards.length)}
        </button>
      </div>

      {/* List content */}
      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="scratch-cards-grid fade-in">
          {activeTab === 'pending' && (
            pendingCards.length === 0 ? (
              <div className="glass-panel empty-tab-panel">
                <p>{t.scratch_empty_pending}</p>
              </div>
            ) : (
              pendingCards.map(card => (
                <ScratchCardItem
                  key={card._id}
                  card={card}
                  activeTab={activeTab}
                  t={t}
                  language={language}
                  onScratch={setScratchingCard}
                  onDelete={handleDeleteCard}
                />
              ))
            )
          )}

          {activeTab === 'scratched' && (
            scratchedCards.length === 0 ? (
              <div className="glass-panel empty-tab-panel">
                <p>{t.scratch_empty_scratched}</p>
              </div>
            ) : (
              scratchedCards.map(card => (
                <ScratchCardItem
                  key={card._id}
                  card={card}
                  activeTab={activeTab}
                  t={t}
                  language={language}
                  onScratch={setScratchingCard}
                  onDelete={handleDeleteCard}
                />
              ))
            )
          )}

          {activeTab === 'created' && (
            createdCards.length === 0 ? (
              <div className="glass-panel empty-tab-panel">
                <p>{t.scratch_empty_created}</p>
              </div>
            ) : (
              createdCards.map(card => (
                <ScratchCardItem
                  key={card._id}
                  card={card}
                  activeTab={activeTab}
                  t={t}
                  language={language}
                  onScratch={setScratchingCard}
                  onDelete={handleDeleteCard}
                />
              ))
            )
          )}
        </div>
      )}

      {/* SCRATCH LIGHTBOX OVERLAY */}
      {scratchingCard && (
        <ScratchLightbox
          card={scratchingCard}
          onClose={() => {
            setScratchingCard(null);
            carregarRaspadinhas(); // recarrega a lista para atualizar estados
          }}
          onScratchComplete={() => handleMarkAsScratched(scratchingCard._id)}
          t={t}
        />
      )}
    </div>
  );
}
