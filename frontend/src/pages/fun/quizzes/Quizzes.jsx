import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import QuizCreator from '../../../components/quizzes/QuizCreator';
import QuizPlayer from '../../../components/quizzes/QuizPlayer';
import QuizFeedback from '../../../components/quizzes/QuizFeedback';
import QuizDashboardLists from '../../../components/quizzes/QuizDashboardLists';
import QuizAiGenerator from '../../../components/quizzes/QuizAiGenerator';
import useQuizzes from '../../../hooks/fun/useQuizzes';
import './Quizzes.css';

export default function Quizzes() {
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');

  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const {
    erro,
    loading,
    showCreator,
    setShowCreator,
    quizTitle,
    setQuizTitle,
    questions,
    adicionarPergunta,
    removerPergunta,
    atualizarPergunta,
    atualizarOpcao,
    submeterNovoQuiz,
    activeQuiz,
    setActiveQuiz,
    currentGuesses,
    setCurrentGuesses,
    selectedCompletedQuiz,
    setSelectedCompletedQuiz,
    iniciarQuiz,
    submeterRespostas,
    apagarQuiz,
    quizzesPendentesParaMim,
    meusQuizzesCriados,
    historicoQuizzesCompletados,
    generatingAI,
    aiNotice,
    setAiNotice,
    gerarQuizComIA
  } = useQuizzes(t, language, meuNome);

  const handleGenerateAI = async (themeToGenerate) => {
    if (!themeToGenerate.trim()) return;
    await gerarQuizComIA(themeToGenerate);
  };

  return (
    <div className="app-container fade-in">
      {/* Cabeçalho */}
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.quizzes_title}</h1>
        <div className="page-header-spacer"></div>
      </div>

      {erro && <p style={{ color: 'var(--danger-color)', textAlign: 'center', fontWeight: 'bold' }}>{erro}</p>}

      {/* TELA DE JOGAR QUIZ (RESPONDER) */}
      {activeQuiz && (
        <QuizPlayer
          t={t}
          activeQuiz={activeQuiz}
          setActiveQuiz={setActiveQuiz}
          currentGuesses={currentGuesses}
          setCurrentGuesses={setCurrentGuesses}
          submeterRespostas={submeterRespostas}
        />
      )}

      {/* FEEDBACK DE QUIZ CONCLUÍDO (LIGHTBOX MODAL) */}
      {selectedCompletedQuiz && (
        <QuizFeedback
          t={t}
          selectedCompletedQuiz={selectedCompletedQuiz}
          setSelectedCompletedQuiz={setSelectedCompletedQuiz}
        />
      )}

      {/* FORMULÁRIO DE CRIAÇÃO DE QUIZ */}
      {showCreator && (
        <>
          {aiNotice && (
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '12px 20px',
              borderRadius: '12px',
              border: '1px solid #ffeeba',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              <span>⚠️ {t.quizzes_ai_warning_no_key}</span>
              <button 
                onClick={() => setAiNotice(false)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#856404', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>
          )}
          <QuizCreator
            t={t}
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
            questions={questions}
            adicionarPergunta={adicionarPergunta}
            removerPergunta={removerPergunta}
            atualizarPergunta={atualizarPergunta}
            atualizarOpcao={atualizarOpcao}
            submeterNovoQuiz={submeterNovoQuiz}
            setShowCreator={setShowCreator}
          />
        </>
      )}

      {/* DASHBOARD PRINCIPAL DE QUIZZES */}
      {!activeQuiz && (
        <div className="quizzes-dashboard-container">
          
          {/* Botão de abrir criador e Bloco IA */}
          {!showCreator && (
            <div className="quizzes-creator-selector">
              <h2 style={{ fontSize: '18px', margin: '0 0 5px 0', color: 'var(--primary-color)', textAlign: 'center' }}>
                ✨ Como queres criar o teu Quiz?
              </h2>
              
              <div style={{ display: 'flex', gap: '15px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => { setShowCreator(true); setAiNotice(false); }} style={{ flex: '1', minWidth: '180px' }}>
                  {t.quizzes_dashboard_create_btn}
                </button>
              </div>

              <div style={{ width: '100%', borderTop: '1px solid var(--card-border, rgba(255, 255, 255, 0.3))', margin: '5px 0' }}></div>

              <QuizAiGenerator 
                generatingAI={generatingAI}
                handleGenerateAI={handleGenerateAI}
                t={t}
              />
            </div>
          )}

          <QuizDashboardLists
            loading={loading}
            quizzesPendentesParaMim={quizzesPendentesParaMim}
            meusQuizzesCriados={meusQuizzesCriados}
            historicoQuizzesCompletados={historicoQuizzesCompletados}
            t={t}
            language={language}
            iniciarQuiz={iniciarQuiz}
            setSelectedCompletedQuiz={setSelectedCompletedQuiz}
            apagarQuiz={apagarQuiz}
          />
        </div>
      )}
    </div>
  );
}
