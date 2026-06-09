import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { likelyService } from '../../services/fun/likelyService';
import { authService } from '../../services/auth/authService';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import LikelyQuestionCard from '../../components/likely/LikelyQuestionCard';
import LikelyQuestionCreator from '../../components/likely/LikelyQuestionCreator';
import './Likely.css';

export default function Likely() {
  const [questions, setQuestions] = useState([]);
  const [partnerName, setPartnerName] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states (creating new question)
  const [showCreator, setShowCreator] = useState(false);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome') || '';
  const minhaRole = localStorage.getItem('role') || '';
  
  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarDados();
  }, [navigate]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Carregar casal e perguntas
      const [dadosCasal, dadosPerguntas] = await Promise.all([
        authService.getCoupleInfo(),
        likelyService.getLikelyQuestions()
      ]);

      const partner = dadosCasal.partnerNames?.find(name => name !== meuNome) || '';
      setPartnerName(partner);
      setQuestions(dadosPerguntas);
    } catch (err) {
      setError(t.likely_error_load || 'Erro ao carregar o jogo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (text) => {
    try {
      setCreating(true);
      setError('');
      const newQuestion = await likelyService.createLikelyQuestion({
        text: text.trim()
      });
      setQuestions([newQuestion, ...questions]);
      setShowCreator(false);
      alert(t.likely_success_created || 'Pergunta adicionada!');
    } catch (err) {
      setError(t.likely_error_save || 'Erro ao criar pergunta.');
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (questionId, voteTarget) => {
    if (!partnerName) {
      alert(language === 'pt' ? 'Conecta primeiro um parceiro nas Definições para jogar!' : 'Connect a partner in Settings first to play!');
      return;
    }

    const votedFor = voteTarget === 'me' ? meuNome : partnerName;

    try {
      setError('');
      const updated = await likelyService.voteLikelyQuestion(questionId, { votedFor });
      setQuestions(questions.map(q => q._id === questionId ? updated : q));
    } catch (err) {
      setError(t.likely_error_vote || 'Erro ao registar voto.');
    }
  };

  const handleDeleteQuestion = async (e, id) => {
    e.stopPropagation();
    const confirmMsg = t.likely_confirm_delete || 'Tens a certeza que queres eliminar esta pergunta?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');
      await likelyService.deleteLikelyQuestion(id);
      setQuestions(questions.filter(q => q._id !== id));
    } catch (err) {
      setError(t.likely_error_delete || 'Erro ao eliminar pergunta.');
    }
  };

  // Filtrar as perguntas com base nas respostas
  const getIsQuestionCompleted = (q) => q.votes.length === 2;

  const filteredQuestions = questions.filter(q => {
    const isCompleted = getIsQuestionCompleted(q);
    if (filter === 'active') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  // Calcular score de afinidade
  const completedQuestions = questions.filter(getIsQuestionCompleted);
  const matchedCount = completedQuestions.filter(q => q.isMatched).length;
  const affinityScore = completedQuestions.length > 0 
    ? Math.round((matchedCount / completedQuestions.length) * 100) 
    : 0;

  return (
    <div className="app-container fade-in">
      {/* Header */}
      <div className="likely-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="likely-page-title">{t.likely_title || 'Quem é Mais Provável... 🃏'}</h1>
        <div style={{ width: '100px' }} className="header-spacer"></div>
      </div>

      <p className="likely-subtitle">{t.likely_subtitle || 'Votem secretamente e comparem respostas de sintonia'}</p>

      {error && (
        <div className="likely-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Affinity Score Card */}
      {!loading && completedQuestions.length > 0 && (
        <div className="glass-panel likely-score-widget fade-in">
          <div className="score-ring-container">
            <svg className="score-ring-svg" viewBox="0 0 100 100">
              <circle className="ring-bg" cx="50" cy="50" r="40" />
              <circle 
                className="ring-progress" 
                cx="50" 
                cy="50" 
                r="40" 
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * affinityScore) / 100}
              />
            </svg>
            <div className="score-ring-text">
              <span className="score-value">{affinityScore}%</span>
              <span className="score-label">{language === 'pt' ? 'Afinidade' : 'Affinity'}</span>
            </div>
          </div>

          <div className="score-stats-info">
            <h3>{t.likely_affinity_score || 'A vossa afinidade'}</h3>
            <p>
              {language === 'pt'
                ? `Acertaram em ${matchedCount} de ${completedQuestions.length} perguntas completas!`
                : `Matched ${matchedCount} out of ${completedQuestions.length} completed questions!`}
            </p>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="likely-controls-bar">
        <div className="likely-filters glass-panel">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t.coupon_filter_all || 'Todos'} ({questions.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            {language === 'pt' ? 'Ativos' : 'Active'} ({questions.filter(q => !getIsQuestionCompleted(q)).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            {t.letter_status_opened ? t.letter_status_opened.split(' ')[0] : 'Completos'} ({completedQuestions.length})
          </button>
        </div>

        <button 
          className="btn btn-primary btn-add-likely" 
          onClick={() => setShowCreator(true)}
          disabled={loading}
        >
          ➕ {t.likely_create_title || 'Nova Pergunta'}
        </button>
      </div>

      {/* Creator Modal */}
      {showCreator && (
        <LikelyQuestionCreator
          onClose={() => setShowCreator(false)}
          onSubmit={handleCreateQuestion}
          creating={creating}
          t={t}
        />
      )}

      {/* Questions list */}
      {loading ? (
        <div className="likely-loading-spinner-container">
          <div className="spinner"></div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="glass-panel empty-likely-state">
          <p>{t.likely_empty_state || 'Nenhuma pergunta adicionada.'}</p>
        </div>
      ) : (
        <div className="likely-grid fade-in">
          {filteredQuestions.map(q => (
            <LikelyQuestionCard
              key={q._id}
              q={q}
              meuNome={meuNome}
              minhaRole={minhaRole}
              partnerName={partnerName}
              onVote={handleVote}
              onDelete={handleDeleteQuestion}
              language={language}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
