import React from 'react';
import { formatDateShort } from '../../utils/dateFormatter';

export default function QuizDashboardLists({
  loading,
  quizzesPendentesParaMim,
  meusQuizzesCriados,
  historicoQuizzesCompletados,
  t,
  language,
  iniciarQuiz,
  setSelectedCompletedQuiz,
  apagarQuiz
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
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
                    {language === 'pt' ? 'Perguntas' : 'Questions'}: {q.questions.length} | {language === 'pt' ? 'Criado em' : 'Created on'}: {formatDateShort(q.createdAt, language === 'pt' ? 'pt' : 'en')}
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
  );
}
