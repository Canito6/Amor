import React, { useState, useEffect } from 'react';
import { dailyCheckInService } from '../../../../services/couple/dailyCheckInService';
import { useSocket } from '../../../../context/SocketContext';
import CheckInConfetti from './CheckInConfetti';
import CheckInForm from './CheckInForm';
import CheckInWaiting from './CheckInWaiting';
import CheckInRevealed from './CheckInRevealed';
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
  const revelado = checkInData.revealed;

  return (
    <div className="daily-checkin-widget glass-panel fade-in">
      
      <CheckInConfetti
        showConfetti={showConfetti}
        confettiParticles={confettiParticles}
      />

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
          <CheckInForm
            onSubmit={handleSubmit}
            answerInput={answerInput}
            setAnswerInput={setAnswerInput}
            submitting={submitting}
            error={error}
            t={t}
          />
        )}

        {/* 2. ESTADO: Eu respondi, mas o parceiro ainda não */}
        {jáRespondi && !revelado && (
          <CheckInWaiting
            t={t}
            meuRegisto={meuRegisto}
          />
        )}

        {/* 3. ESTADO: Ambos responderam (Revelado) */}
        {revelado && (
          <CheckInRevealed
            t={t}
            meuRegisto={meuRegisto}
            parceiroRegisto={parceiroRegisto}
            username={username}
            onSubmitEdit={handleSubmit}
            answerInput={answerInput}
            setAnswerInput={setAnswerInput}
            submitting={submitting}
            success={success}
            error={error}
          />
        )}

      </div>
    </div>
  );
}
