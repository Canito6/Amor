import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scratchCardService } from '../../../services/fun/scratchCardService';
import { usePreferences } from '../../../context/PreferencesContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { translations } from '../../../services/common/translations';
import ScratchLightbox from '../../../components/raspadinhas/ScratchLightbox';
import ScratchCardCreator from '../../../components/raspadinhas/ScratchCardCreator';
import ScratchTabs from '../../../components/raspadinhas/ScratchTabs';
import ScratchCardList from '../../../components/raspadinhas/ScratchCardList';
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
  const { showToast } = useToast();
  const { confirm } = useConfirm();
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
      showToast(t.scratch_success_created || 'Raspadinha criada!', 'success');
    } catch (err) {
      setError(t.scratch_error_save || 'Erro ao guardar raspadinha.');
      throw err; // throw to propagate to the form state
    }
  };

  const handleDeleteCard = async (id) => {
    const ok = await confirm({
      title: t.scratch_confirm_delete || 'Apagar raspadinha?',
      message: t.scratch_confirm_delete || 'Tens a certeza?',
      confirmText: t.delete || 'Apagar',
      cancelText: t.cancel || 'Cancelar',
    });
    if (!ok) return;
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
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.scratch_title}</h1>
        <div className="page-header-spacer"></div>
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
      <ScratchTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCards.length}
        scratchedCount={scratchedCards.length}
        createdCount={createdCards.length}
        t={t}
      />

      {/* List content */}
      <ScratchCardList 
        loading={loading}
        activeTab={activeTab}
        pendingCards={pendingCards}
        scratchedCards={scratchedCards}
        createdCards={createdCards}
        t={t}
        language={language}
        setScratchingCard={setScratchingCard}
        handleDeleteCard={handleDeleteCard}
      />

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
