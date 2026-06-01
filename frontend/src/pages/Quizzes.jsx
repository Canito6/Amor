import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';

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
      const dados = await apiFetch('/api/quizzes');
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
      const novo = await apiFetch('/api/quizzes', {
        method: 'POST',
        body: { title: quizTitle, questions }
      });
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
      const atualizado = await apiFetch(`/api/quizzes/${activeQuiz._id}/guess`, {
        method: 'PUT',
        body: { guesses: currentGuesses }
      });

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
      await apiFetch(`/api/quizzes/${id}`, { method: 'DELETE' });
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
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--secondary-color)', marginBottom: '10px' }}>{t.quizzes_playing_title.replace('{title}', activeQuiz.title)}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>
            {t.quizzes_playing_desc.replace('{creator}', activeQuiz.createdBy)}
          </p>

          <form onSubmit={submeterRespostas} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {activeQuiz.questions.map((q, qIndex) => (
              <div 
                key={q._id || qIndex} 
                className="glass-panel" 
                style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '16px', borderLeft: '5px solid var(--primary-color)' }}
              >
                <h3 style={{ fontSize: '17px', marginBottom: '15px' }}>
                  {qIndex + 1}. {q.questionText}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options.map((opt, oIndex) => (
                    <label 
                      key={oIndex} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '12px 16px', 
                        background: currentGuesses[qIndex] === opt ? 'rgba(255, 77, 109, 0.15)' : 'white',
                        border: currentGuesses[qIndex] === opt ? '2px solid var(--primary-color)' : '1px solid #ddd',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: currentGuesses[qIndex] === opt ? '600' : 'normal',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        value={opt}
                        checked={currentGuesses[qIndex] === opt}
                        onChange={() => {
                          const novosGuesses = [...currentGuesses];
                          novosGuesses[qIndex] = opt;
                          setCurrentGuesses(novosGuesses);
                        }}
                        style={{ display: 'none' }}
                      />
                      <span style={{ fontSize: '15px' }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button type="button" className="btn btn-dark" onClick={() => setActiveQuiz(null)}>
                {t.quizzes_button_giveup}
              </button>
              <button type="submit" className="btn btn-primary">
                {t.quizzes_button_submit}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FEEDBACK DE QUIZ CONCLUÍDO (LIGHTBOX MODAL) */}
      {selectedCompletedQuiz && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedCompletedQuiz(null)}
        >
          <div 
            className="glass-panel" 
            style={{ 
              maxWidth: '650px', 
              width: '100%', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              padding: '30px', 
              background: '#fff',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
              onClick={() => setSelectedCompletedQuiz(null)}
            >
              &times;
            </button>

            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <span style={{ fontSize: '60px' }}>🎉</span>
              <h2 style={{ color: 'var(--primary-color)', fontSize: '24px', marginTop: '10px' }}>
                {t.quizzes_lightbox_result.replace('{title}', selectedCompletedQuiz.title)}
              </h2>
              <p style={{ fontSize: '18px', margin: '15px 0' }}>
                {t.quizzes_lightbox_score.replace('{score}', selectedCompletedQuiz.score).replace('{total}', selectedCompletedQuiz.questions.length)}
              </p>
            </div>

            <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px' }}>
              {t.quizzes_lightbox_review}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {selectedCompletedQuiz.questions.map((q, index) => {
                const acertou = q.creatorAnswer === q.partnerGuess;
                return (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '15px', 
                      borderRadius: '12px', 
                      background: acertou ? 'rgba(42, 157, 143, 0.08)' : 'rgba(230, 57, 70, 0.08)',
                      border: acertou ? '1px solid rgba(42, 157, 143, 0.3)' : '1px solid rgba(230, 57, 70, 0.3)'
                    }}
                  >
                    <p style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}>
                      {index + 1}. {q.questionText}
                    </p>
                    <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: '#2a9d8f' }}>
                        {t.quizzes_lightbox_correct.replace('{creator}', selectedCompletedQuiz.createdBy).replace('{answer}', q.creatorAnswer)}
                      </span>
                      <span style={{ color: acertou ? '#2a9d8f' : '#e63946' }}>
                        {acertou 
                          ? t.quizzes_lightbox_guess_correct.replace('{guess}', q.partnerGuess) 
                          : t.quizzes_lightbox_guess_wrong.replace('{guess}', q.partnerGuess)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
              <button className="btn btn-primary" onClick={() => setSelectedCompletedQuiz(null)}>
                {t.quizzes_lightbox_close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE CRIAÇÃO DE QUIZ */}
      {showCreator && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', margin: 0 }}>{t.quizzes_create_title}</h2>
            <button className="btn btn-dark" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowCreator(false)}>
              {t.quizzes_create_close}
            </button>
          </div>

          <form onSubmit={submeterNovoQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="input-label">{t.quizzes_create_quiz_title}</label>
              <input
                type="text"
                placeholder={t.quizzes_placeholder_title}
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                required
                className="input-control"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '10px' }}>
              {questions.map((q, pIndex) => (
                <div 
                  key={pIndex} 
                  className="glass-panel" 
                  style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '16px', position: 'relative' }}
                >
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerPergunta(pIndex)}
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger-color)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                      title="Remover pergunta"
                    >
                      🗑️
                    </button>
                  )}

                  <h3 style={{ fontSize: '15px', marginBottom: '15px', color: 'var(--primary-color)' }}>
                    {t.quizzes_create_question_num.replace('{num}', pIndex + 1)}
                  </h3>

                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label className="input-label">{t.quizzes_create_question_text}</label>
                    <input
                      type="text"
                      placeholder={t.quizzes_placeholder_qtext}
                      value={q.questionText}
                      onChange={(e) => atualizarPergunta(pIndex, 'questionText', e.target.value)}
                      required
                      className="input-control"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="form-group" style={{ margin: 0 }}>
                        <label className="input-label">{t.quizzes_create_option_num.replace('{num}', oIndex + 1)}</label>
                        <input
                          type="text"
                          placeholder={t.quizzes_create_option_num.replace('{num}', oIndex + 1)}
                          value={opt}
                          onChange={(e) => atualizarOpcao(pIndex, oIndex, e.target.value)}
                          required
                          className="input-control"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="input-label">{t.quizzes_create_correct_select}</label>
                    <select
                      value={q.creatorAnswer}
                      onChange={(e) => atualizarPergunta(pIndex, 'creatorAnswer', e.target.value)}
                      required
                      className="input-control"
                      style={{ appearance: 'auto' }}
                    >
                      <option value="">{t.quizzes_create_correct_placeholder}</option>
                      {q.options.filter(o => o.trim() !== '').map((opt, oIndex) => (
                        <option key={oIndex} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={adicionarPergunta}>
                {t.quizzes_create_add_question}
              </button>
              <button type="submit" className="btn btn-primary">
                {t.quizzes_create_publish}
              </button>
            </div>
          </form>
        </div>
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
