import { useEffect, useRef } from 'react';

export default function QuizFeedback({
  t,
  selectedCompletedQuiz,
  setSelectedCompletedQuiz
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const totalQuestions = selectedCompletedQuiz.questions.length;
  const score = selectedCompletedQuiz.score;
  const isPerfectScore = score === totalQuestions;

  useEffect(() => {
    if (!isPerfectScore) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Fit canvas to screen size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Confetti particles definition
    const colors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffd166', '#06d6a0', '#118ab2', '#7209b7', '#f72585'];
    const particles = [];
    const width = canvas.width;
    const height = canvas.height;

    // Spawn 150 particles bursting from bottom corners and center
    for (let i = 0; i < 150; i++) {
      const fromLeft = Math.random() < 0.5;
      particles.push({
        x: fromLeft ? 0 : width,
        y: height * 0.8,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: fromLeft ? (3 + Math.random() * 6) : -(3 + Math.random() * 6),
        vy: -(10 + Math.random() * 12), // explosive upward burst
        rotation: Math.random() * 360,
        rotationSpeed: -10 + Math.random() * 20
      });
    }

    const runLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let active = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vy += 0.22; // gravity
        p.vx *= 0.98; // air resistance

        // Draw rotated particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        ctx.restore();

        if (p.y < canvas.height + 20) {
          active = true;
        }
      });

      if (active) {
        animFrameRef.current = requestAnimationFrame(runLoop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animFrameRef.current = requestAnimationFrame(runLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPerfectScore]);

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
      {/* Confetti Canvas overlays the screen */}
      {isPerfectScore && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 10000
          }}
        />
      )}

      <div 
        className="glass-panel fade-in" 
        style={{ 
          maxWidth: '650px', 
          width: '100%', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          padding: '30px', 
          background: '#fff',
          position: 'relative',
          zIndex: 10001 // above the canvas so buttons remain clickable!
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
          <span style={{ fontSize: '60px' }}>{isPerfectScore ? '🏆💖' : '🎉'}</span>
          <h2 style={{ color: 'var(--primary-color)', fontSize: '24px', marginTop: '10px' }}>
            {t.quizzes_lightbox_result.replace('{title}', selectedCompletedQuiz.title)}
          </h2>
          <p style={{ fontSize: '18px', margin: '15px 0', fontWeight: 'bold', color: isPerfectScore ? 'var(--success-color)' : 'var(--text-main)' }}>
            {isPerfectScore 
              ? (selectedCompletedQuiz.createdBy ? `Conexão Perfeita com ${selectedCompletedQuiz.createdBy}! ✨` : 'Conexão Perfeita! ✨')
              : ''}
            <br />
            <span style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
              {t.quizzes_lightbox_score.replace('{score}', score).replace('{total}', totalQuestions)}
            </span>
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
