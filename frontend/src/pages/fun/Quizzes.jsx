import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import QuizCreator from '../../components/quizzes/QuizCreator';
import QuizPlayer from '../../components/quizzes/QuizPlayer';
import QuizFeedback from '../../components/quizzes/QuizFeedback';
import QuizDashboardLists from '../../components/quizzes/QuizDashboardLists';
import useQuizzes from '../../hooks/useQuizzes';

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
    historicoQuizzesCompletados
  } = useQuizzes(t, language, meuNome);

  return (
    <div className="app-container fade-in">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>{t.quizzes_title}</h1>
        <div style={{ width: '150px' }}></div>
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
      )}

      {/* DASHBOARD PRINCIPAL DE QUIZZES */}
      {!activeQuiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Botão de abrir criador */}
          {!showCreator && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowCreator(true)}>
                {t.quizzes_dashboard_create_btn}
              </button>
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
