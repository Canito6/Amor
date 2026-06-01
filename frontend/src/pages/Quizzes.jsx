import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import QuizCreator from '../components/quizzes/QuizCreator';
import QuizPlayer from '../components/quizzes/QuizPlayer';
import QuizFeedback from '../components/quizzes/QuizFeedback';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados de Criação de Quiz
  const [showCreator, setShowCreator] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', ''], creatorAnswer: '' }
  ]);

  // Estados de Resposta a Quiz
  const [activeQuiz, setActiveQuiz] = useState(null); // Quiz a ser respondido
  const [currentGuesses, setCurrentGuesses] = useState([]); // Array de respostas dadas

  // Estado para ver detalhes de um Quiz Concluído
  const [selectedCompletedQuiz, setSelectedCompletedQuiz] = useState(null);

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarQuizzes();
  }, [navigate]);

  const carregarQuizzes = async () => {
    try {
      setLoading(true);
      const dados = await quizService.getQuizzes();
      setQuizzes(dados);
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao carregar quizzes.' : 'Error loading quizzes.'));
    } finally {
      setLoading(false);
    }
  };

  // Funções de Criação
  const adicionarPergunta = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', ''], creatorAnswer: '' }]);
  };

  const removerPergunta = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const atualizarPergunta = (index, campo, valor) => {
    const novasPerguntas = [...questions];
    novasPerguntas[index][campo] = valor;
    setQuestions(novasPerguntas);
  };

  const atualizarOpcao = (pIndex, oIndex, valor) => {
    const novasPerguntas = [...questions];
    novasPerguntas[pIndex].options[oIndex] = valor;
    // Se a resposta antiga corresponder à opção alterada, atualiza também
    novasPerguntas[pIndex].creatorAnswer = '';
    setQuestions(novasPerguntas);
  };

  const submeterNovoQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    // Validações básicas
    for (const [index, q] of questions.entries()) {
      if (!q.questionText.trim()) {
        alert(t.quizzes_alert_empty_question.replace('{num}', index + 1));
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(t.quizzes_alert_empty_option.replace('{num}', index + 1));
        return;
      }
      if (!q.creatorAnswer) {
        alert(t.quizzes_alert_no_correct.replace('{num}', index + 1));
        return;
      }
    }

    try {
      setErro('');
      const novo = await quizService.createQuiz({ title: quizTitle, questions });
      setQuizzes([novo, ...quizzes]);
      setQuizTitle('');
      setQuestions([{ questionText: '', options: ['', '', ''], creatorAnswer: '' }]);
      setShowCreator(false);
      alert(t.quizzes_alert_created_success);
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao criar quiz.' : 'Error creating quiz.'));
    }
  };

  // Funções de Resposta
  const iniciarQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentGuesses(new Array(quiz.questions.length).fill(''));
  };

  const submeterRespostas = async (e) => {
    e.preventDefault();
    if (currentGuesses.some(g => g === '')) {
      alert(t.quizzes_alert_unanswered);
      return;
    }

    try {
      setErro('');
      const atualizado = await quizService.submitGuesses(activeQuiz._id, currentGuesses);

      // Atualiza na lista de quizzes
      setQuizzes(quizzes.map(q => q._id === atualizado._id ? atualizado : q));
      setActiveQuiz(null);
      setSelectedCompletedQuiz(atualizado); // Abre o feedback
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao submeter respostas.' : 'Error submitting answers.'));
    }
  };

  const apagarQuiz = async (id) => {
    if (!window.confirm(t.quizzes_confirm_delete)) return;
    try {
      setErro('');
      await quizService.deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q._id !== id));
      if (selectedCompletedQuiz && selectedCompletedQuiz._id === id) {
        setSelectedCompletedQuiz(null);
      }
    } catch (err) {
      setErro(err.message || (language === 'pt' ? 'Erro ao apagar quiz.' : 'Error deleting quiz.'));
    }
  };

  // Categorização de quizzes
  const quizzesPendentesParaMim = quizzes.filter(q => q.createdBy !== meuNome && !q.completed);
  const meusQuizzesCriados = quizzes.filter(q => q.createdBy === meuNome);
  const historicoQuizzesCompletados = quizzes.filter(q => q.createdBy !== meuNome && q.completed);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Botão de abrir criador */}
          {!showCreator && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => setShowCreator(true)}>
                {t.quizzes_dashboard_create_btn}
              </button>
            </div>
          )}

          {/* LISTA: QUIZZES PENDENTES DE RESPONDER */}
          <div className="glass-panel" style={{ padding: '25px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--primary-color)', marginBottom: '15px' }}>
              {t.quizzes_dashboard_pending_title.replace('{count}', quizzesPendentesParaMim.length)}
            </h2>
            
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>{language === 'pt' ? 'A carregar quizzes...' : 'Loading quizzes...'}</p>
            ) : quizzesPendentesParaMim.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                {t.quizzes_dashboard_pending_empty}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quizzesPendentesParaMim.map((q) => (
                  <div 
                    key={q._id} 
                    style={{ 
                      padding: '15px 20px', 
                      background: 'white', 
                      borderRadius: '16px', 
                      border: '1px solid #eee', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>{q.title}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Perguntas: {q.questions.length} | De: <strong>{q.createdBy}</strong>
                      </span>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => iniciarQuiz(q)}>
                      {t.quizzes_dashboard_pending_btn}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LISTA: MEUS QUIZZES CRIADOS */}
          <div className="glass-panel" style={{ padding: '25px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--secondary-color)', marginBottom: '15px' }}>
              {t.quizzes_dashboard_my_title.replace('{count}', meusQuizzesCriados.length)}
            </h2>
            
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>{language === 'pt' ? 'A carregar quizzes...' : 'Loading quizzes...'}</p>
            ) : meusQuizzesCriados.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                {t.quizzes_dashboard_my_empty}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {meusQuizzesCriados.map((q) => (
                  <div 
                    key={q._id} 
                    style={{ 
                      padding: '15px 20px', 
                      background: 'white', 
                      borderRadius: '16px', 
                      border: '1px solid #eee', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>{q.title}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {language === 'pt' ? 'Perguntas' : 'Questions'}: {q.questions.length} | {language === 'pt' ? 'Criado em' : 'Created on'}: {new Date(q.createdAt).toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US')}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {q.completed ? (
                        <span 
                          style={{ 
                            fontSize: '13.5px', 
                            color: 'var(--success-color)', 
                            background: 'rgba(42, 157, 143, 0.1)', 
                            padding: '6px 12px', 
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedCompletedQuiz(q)}
                          title={language === 'pt' ? "Carrega para ver as respostas" : "Click to view responses"}
                        >
                          {t.quizzes_dashboard_my_completed_status.replace('{score}', q.score).replace('{total}', q.questions.length)}
                        </span>
                      ) : (
                        <span 
                          style={{ 
                            fontSize: '13px', 
                            color: 'var(--text-muted)', 
                            background: '#f5f5f5', 
                            padding: '6px 12px', 
                            borderRadius: '10px'
                          }}
                        >
                          {t.quizzes_dashboard_my_pending_status}
                        </span>
                      )}

                      <button
                        onClick={() => apagarQuiz(q._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger-color)',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '5px'
                        }}
                        title="Apagar Quiz"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LISTA: HISTÓRICO DE QUIZZES QUE JÁ RESPONDI */}
          <div className="glass-panel" style={{ padding: '25px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '15px' }}>
              {t.quizzes_dashboard_history_title.replace('{count}', historicoQuizzesCompletados.length)}
            </h2>
            
            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>{language === 'pt' ? 'A carregar quizzes...' : 'Loading quizzes...'}</p>
            ) : historicoQuizzesCompletados.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                {t.quizzes_dashboard_history_empty}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historicoQuizzesCompletados.map((q) => (
                  <div 
                    key={q._id} 
                    style={{ 
                      padding: '15px 20px', 
                      background: 'white', 
                      borderRadius: '16px', 
                      border: '1px solid #eee', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>{q.title}</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        De: <strong>{q.createdBy}</strong> | Pontuação: {q.score}/{q.questions.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        className="btn btn-dark" 
                        style={{ padding: '6px 12px', fontSize: '12.5px' }} 
                        onClick={() => setSelectedCompletedQuiz(q)}
                      >
                        {t.quizzes_dashboard_history_btn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
