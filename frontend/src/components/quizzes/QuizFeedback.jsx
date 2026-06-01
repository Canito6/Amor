import React from 'react';

export default function QuizFeedback({
  t,
  selectedCompletedQuiz,
  setSelectedCompletedQuiz
}) {
  return (
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
  );
}
