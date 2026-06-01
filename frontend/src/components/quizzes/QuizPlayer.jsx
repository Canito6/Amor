import React from 'react';

export default function QuizPlayer({
  t,
  activeQuiz,
  setActiveQuiz,
  currentGuesses,
  setCurrentGuesses,
  submeterRespostas
}) {
  return (
    <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
      <h2 style={{ color: 'var(--secondary-color)', marginBottom: '10px' }}>
        {t.quizzes_playing_title.replace('{title}', activeQuiz.title)}
      </h2>
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
  );
}
