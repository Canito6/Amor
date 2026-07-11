import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { likelyService } from '../../../services/fun/likelyService';
import { authService } from '../../../services/auth/authService';
import { usePreferences } from '../../../context/PreferencesContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { translations } from '../../../services/common/translations';
import LikelyQuestionCreator from '../../../components/likely/LikelyQuestionCreator';
import LikelyScoreCard from '../../../components/likely/LikelyScoreCard';
import LikelyFilters from '../../../components/likely/LikelyFilters';
import LikelyList from '../../../components/likely/LikelyList';
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
  const { showToast } = useToast();
  const { confirm } = useConfirm();
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
      showToast(t.likely_success_created || 'Pergunta adicionada!', 'success');
    } catch (err) {
      setError(t.likely_error_save || 'Erro ao criar pergunta.');
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (questionId, voteTarget) => {
    if (!partnerName) {
      showToast(language === 'pt' ? 'Conecta primeiro um parceiro nas Definições para jogar!' : 'Connect a partner in Settings first to play!', 'error');
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
    const ok = await confirm({ title: confirmMsg, message: confirmMsg, confirmText: t.delete || 'Apagar', cancelText: t.cancel || 'Cancelar' });
    if (!ok) return;

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
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.likely_title || 'Quem é Mais Provável... 🃏'}</h1>
        <div className="page-header-spacer"></div>
      </div>

      <p className="likely-subtitle">{t.likely_subtitle || 'Votem secretamente e comparem respostas de sintonia'}</p>

      {error && (
        <div className="likely-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Affinity Score Card */}
      {!loading && completedQuestions.length > 0 && (
        <LikelyScoreCard 
          affinityScore={affinityScore}
          matchedCount={matchedCount}
          completedQuestionsLength={completedQuestions.length}
          language={language}
          t={t}
        />
      )}

      {/* Controls Bar */}
      <div className="likely-controls-bar">
        <LikelyFilters 
          filter={filter}
          setFilter={setFilter}
          totalCount={questions.length}
          activeCount={questions.filter(q => !getIsQuestionCompleted(q)).length}
          completedCount={completedQuestions.length}
          language={language}
          t={t}
        />

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
      <LikelyList 
        loading={loading}
        filteredQuestions={filteredQuestions}
        meuNome={meuNome}
        minhaRole={minhaRole}
        partnerName={partnerName}
        onVote={handleVote}
        onDelete={handleDeleteQuestion}
        language={language}
        t={t}
      />
    </div>
  );
}
