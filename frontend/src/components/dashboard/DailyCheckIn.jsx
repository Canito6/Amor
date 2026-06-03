import React, { useState, useEffect } from 'react';
import { dailyCheckInService } from '../../services/dailyCheckInService';
import { useSocket } from '../../context/SocketContext';
import './DailyCheckIn.css';

export default function DailyCheckIn({ t, language }) {
  const socket = useSocket();
  const username = localStorage.getItem('username') || localStorage.getItem('nome') || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkInData, setCheckInData] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  
  // Efeito de confete local ao revelar
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);

  // Data de hoje local do cliente no formato YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDateString = getTodayDateString();

  // Função para carregar o Check-in
  const loadDailyCheckIn = async (isRealtimeUpdate = false) => {
    try {
      if (!isRealtimeUpdate) setLoading(true);
      setError('');
      const data = await dailyCheckInService.getDailyCheckIn(todayDateString);
      
      // Se acabou de revelar (passou a ser revelado e antes não era), ativa os confetes
      if (checkInData && !checkInData.revealed && data.revealed) {
        triggerConfetti();
      }
      
      setCheckInData(data);

      // Pré-preencher a resposta do utilizador se ela existir
      const meuRegisto = data.answers.find(ans => ans.username === username);
      if (meuRegisto) {
        setAnswerInput(meuRegisto.answerText);
      }
    } catch (err) {
      console.error('Erro ao carregar check-in diário:', err);
      setError(t.daily_check_load_error || 'Erro ao carregar o check-in.');
    } finally {
      if (!isRealtimeUpdate) setLoading(false);
    }
  };

  // Carregar ao montar e quando a data muda
  useEffect(() => {
    loadDailyCheckIn();
  }, [todayDateString]);

  // Escuta WebSocket para atualizações em tempo real
  useEffect(() => {
    if (!socket) return;

    const handleCheckInCompleted = (data) => {
      if (data.date === todayDateString) {
        loadDailyCheckIn(true);
        triggerConfetti();
      }
    };

    socket.on('daily-checkin-completed', handleCheckInCompleted);

    return () => {
      socket.off('daily-checkin-completed', handleCheckInCompleted);
    };
  }, [socket, todayDateString, checkInData]);

  const triggerConfetti = () => {
    setShowConfetti(true);
    const particles = [];
    const colors = ['#ff4d6d', '#ff758f', '#ffccd5', '#ffb3c1', '#ffd166', '#06d6a0', '#118ab2'];
    for (let i = 0; i < 40; i++) {
      particles.push({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: Math.random() * 100, // percentagem
        size: Math.random() * 10 + 6, // px
        delay: Math.random() * 1.5, // segundos
        duration: Math.random() * 2.5 + 1.5 // segundos
      });
    }
    setConfettiParticles(particles);
    
    // Desligar após as animações acabarem
    setTimeout(() => {
      setShowConfetti(false);
      setConfettiParticles([]);
    }, 4500);
  };

  // Enviar a resposta
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerInput.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const updatedData = await dailyCheckInService.submitAnswer(answerInput, todayDateString);
      
      // Se antes não estava revelado, mas agora está (porque fomos nós a fechar a dupla)
      if (updatedData.revealed) {
        triggerConfetti();
      }

      setCheckInData(updatedData);
      setSuccess(t.daily_checkin_success || 'Resposta gravada! 💑');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Erro ao enviar resposta do check-in:', err);
      setError(err.message || 'Erro ao enviar a resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="daily-checkin-widget glass-panel loading-state">
        <div className="spinner"></div>
        <p>{t.loading || 'A carregar... ⏳'}</p>
      </div>
    );
  }

  if (!checkInData) return null;

  // Encontrar o meu registo e o do parceiro
  const meuRegisto = checkInData.answers.find(ans => ans.username === username);
  const parceiroRegisto = checkInData.answers.find(ans => ans.username !== username);

  const jáRespondi = !!meuRegisto;
  const parceiroRespondeu = !!parceiroRegisto;
  const revelado = checkInData.revealed;

  return (
    <div className="daily-checkin-widget glass-panel fade-in">
      
      {/* Elementos de Confete CSS */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiParticles.map(p => (
            <div
              key={p.id}
              className="confetti-piece"
              style={{
                backgroundColor: p.color,
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="daily-checkin-header">
        <span className="checkin-badge">✨ {t.daily_checkin_title || 'Check-in Diário'}</span>
        <span className="checkin-date">📅 {todayDateString}</span>
      </div>

      <div className="daily-checkin-content">
        <div className="daily-question-container">
          <p className="question-intro">{t.daily_checkin_question_label || 'Pergunta do dia:'}</p>
          <h3 className="daily-question-text">"{checkInData.question}"</h3>
        </div>

        {/* 1. ESTADO: Nenhum respondeu ou utilizador ainda não respondeu */}
        {!jáRespondi && (
          <form onSubmit={handleSubmit} className="checkin-form">
            <p className="checkin-instruction">
              {t.daily_checkin_subtitle || 'Responde para veres o que o teu amor escreveu!'}
            </p>
            <div className="textarea-wrapper">
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder={t.daily_checkin_placeholder || 'Escreve aqui o teu carinho...'}
                maxLength={1000}
                required
                disabled={submitting}
              />
              <span className="char-count">{answerInput.length}/1000</span>
            </div>
            {error && <div className="checkin-error">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary checkin-submit-btn"
              disabled={submitting || !answerInput.trim()}
            >
              {submitting ? (t.daily_checkin_submitting || 'A enviar...') : (t.daily_checkin_submit || 'Enviar Resposta 💖')}
            </button>
          </form>
        )}

        {/* 2. ESTADO: Eu respondi, mas o parceiro ainda não */}
        {jáRespondi && !revelado && (
          <div className="checkin-waiting-container">
            <div className="checkin-waiting-alert">
              <span className="checkin-lock-icon">🔒</span>
              <p>{t.daily_checkin_waiting_partner || 'A aguardar que o teu amor responda para revelar...'}</p>
            </div>
            
            <div className="checkin-comparison-grid">
              {/* O Meu Card */}
              <div className="answer-card user-card">
                <h5>{t.daily_checkin_me || 'A tua resposta:'}</h5>
                <div className="answer-bubble">
                  <span className="quote-mark">“</span>
                  <p>{meuRegisto.answerText}</p>
                </div>
              </div>

              {/* Card do Parceiro Bloqueado */}
              <div className="answer-card partner-card locked-state">
                <h5>{t.daily_checkin_partner || 'Resposta do teu amor:'}</h5>
                <div className="answer-bubble blurred-bubble">
                  <span className="quote-mark">“</span>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec arcu ac lorem efficitur aliquet.</p>
                </div>
                <div className="blur-overlay">
                  <span>💭 {t.daily_checkin_waiting_partner_short || 'Segredo...'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ESTADO: Ambos responderam (Revelado) */}
        {revelado && (
          <div className="checkin-revealed-container bounce-in">
            <div className="checkin-revealed-alert">
              <span className="checkin-revealed-icon">🎉</span>
              <p>{t.daily_checkin_revealed_title || 'As vossas respostas de hoje!'}</p>
            </div>

            <div className="checkin-comparison-grid">
              {/* O Meu Card */}
              <div className="answer-card user-card revealed">
                <h5>{t.daily_checkin_me || 'A tua resposta:'}</h5>
                <div className="answer-bubble">
                  <span className="quote-mark">“</span>
                  <p>{meuRegisto?.answerText}</p>
                </div>
                <span className="answer-author">👤 {username}</span>
              </div>

              {/* Card do Parceiro */}
              <div className="answer-card partner-card revealed">
                <h5>{t.daily_checkin_partner || 'Resposta do teu amor:'}</h5>
                <div className="answer-bubble">
                  <span className="quote-mark">“</span>
                  <p>{parceiroRegisto?.answerText}</p>
                </div>
                <span className="answer-author">👤 {parceiroRegisto?.username}</span>
              </div>
            </div>

            {/* Opção para editar a própria resposta se necessário */}
            <details className="checkin-edit-details">
              <summary className="edit-summary-btn">✏️ Editar a minha resposta</summary>
              <form onSubmit={handleSubmit} className="checkin-edit-form">
                <div className="textarea-wrapper">
                  <textarea
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder={t.daily_checkin_placeholder || 'Atualiza a tua resposta...'}
                    maxLength={1000}
                    required
                    disabled={submitting}
                  />
                </div>
                {success && <div className="checkin-success">{success}</div>}
                {error && <div className="checkin-error">{error}</div>}
                <button
                  type="submit"
                  className="btn btn-secondary checkin-update-btn"
                  disabled={submitting || !answerInput.trim() || answerInput.trim() === meuRegisto?.answerText}
                >
                  {submitting ? 'A atualizar...' : 'Gravar Alteração 💾'}
                </button>
              </form>
            </details>
          </div>
        )}

      </div>
    </div>
  );
}
