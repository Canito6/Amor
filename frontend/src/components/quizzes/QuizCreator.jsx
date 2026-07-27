

export default function QuizCreator({
  t,
  quizTitle,
  setQuizTitle,
  questions,
  adicionarPergunta,
  removerPergunta,
  atualizarPergunta,
  atualizarOpcao,
  submeterNovoQuiz,
  setShowCreator
}) {
  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>{t.quizzes_create_title}</h2>
        <button className="btn btn-dark" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setShowCreator(false)}>
          {t.quizzes_create_close}
        </button>
      </div>

      <form onSubmit={submeterNovoQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group">
          <label htmlFor="quizTitle" className="input-label">{t.quizzes_create_quiz_title}</label>
          <input
            id="quizTitle"
            name="quizTitle"
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
                <label htmlFor={`q-text-${pIndex}`} className="input-label">{t.quizzes_create_question_text}</label>
                <textarea
                  id={`q-text-${pIndex}`}
                  name={`q-text-${pIndex}`}
                  rows={2}
                  placeholder={t.quizzes_placeholder_qtext}
                  value={q.questionText}
                  onChange={(e) => atualizarPergunta(pIndex, 'questionText', e.target.value)}
                  required
                  className="input-control"
                  style={{ resize: 'vertical', width: '100%', minHeight: '60px', fieldSizing: 'content', fontFamily: 'var(--font-body)', lineHeight: '1.4' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} className="form-group" style={{ margin: 0 }}>
                    <label htmlFor={`q-${pIndex}-opt-${oIndex}`} className="input-label">{t.quizzes_create_option_num.replace('{num}', oIndex + 1)}</label>
                    <textarea
                      id={`q-${pIndex}-opt-${oIndex}`}
                      name={`q-${pIndex}-opt-${oIndex}`}
                      rows={1}
                      placeholder={t.quizzes_create_option_num.replace('{num}', oIndex + 1)}
                      value={opt}
                      onChange={(e) => atualizarOpcao(pIndex, oIndex, e.target.value)}
                      required
                      className="input-control"
                      style={{ 
                        resize: 'vertical', 
                        width: '100%', 
                        minHeight: '42px', 
                        fieldSizing: 'content', 
                        fontFamily: 'var(--font-body)', 
                        lineHeight: '1.4' 
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor={`q-correct-${pIndex}`} className="input-label">{t.quizzes_create_correct_select}</label>
                <select
                  id={`q-correct-${pIndex}`}
                  name={`q-correct-${pIndex}`}
                  value={q.creatorAnswer}
                  onChange={(e) => atualizarPergunta(pIndex, 'creatorAnswer', e.target.value)}
                  required
                  className="input-control"
                  style={{ appearance: 'auto', width: '100%', whiteSpace: 'normal', height: 'auto', minHeight: '42px', padding: '10px' }}
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
  );
}
