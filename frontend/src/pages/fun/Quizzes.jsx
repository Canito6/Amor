import { useEffect, useState } from 'react';
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

  const [aiTheme, setAiTheme] = useState('');

  const handleGenerateAI = async (themeToGenerate) => {
    if (!themeToGenerate.trim()) return;
    await gerarQuizComIA(themeToGenerate);
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Botão de abrir criador e Bloco IA */}
          {!showCreator && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '20px',
              padding: '25px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
              maxWidth: '600px',
              margin: '0 auto',
              width: '100%'
            }}>
              <h2 style={{ fontSize: '18px', margin: '0 0 5px 0', color: 'var(--primary-color)', textAlign: 'center' }}>
                ✨ Como queres criar o teu Quiz?
              </h2>
              
              <div style={{ display: 'flex', gap: '15px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => { setShowCreator(true); setAiNotice(false); }} style={{ flex: '1', minWidth: '180px' }}>
                  {t.quizzes_dashboard_create_btn}
                </button>
              </div>

              <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.3)', margin: '5px 0' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color-secondary)' }}>
                  🤖 {t.quizzes_ai_generate_btn}
                </span>

                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder={t.quizzes_ai_theme_placeholder}
                    value={aiTheme}
                    onChange={(e) => setAiTheme(e.target.value)}
                    className="input-control"
                    style={{ flex: 1, margin: 0 }}
                    disabled={generatingAI}
                  />
                  <button 
                    className="btn btn-dark" 
                    onClick={() => handleGenerateAI(aiTheme)}
                    disabled={generatingAI || !aiTheme.trim()}
                    style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '150px' }}
                  >
                    {generatingAI ? t.quizzes_ai_generating : t.quizzes_ai_btn_generate}
                  </button>
                </div>

                {/* Categorias Rápidas */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '5px' }}>
                  {['Romântico 💖', 'Engraçado 🤪', 'Futuro 🔮', 'Geral 🧠'].map((cat) => {
                    const cleanName = cat.split(' ')[0];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleGenerateAI(cleanName)}
                        disabled={generatingAI}
                        style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.8)',
                          borderRadius: '20px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          color: '#555'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.8)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.5)'}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
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
