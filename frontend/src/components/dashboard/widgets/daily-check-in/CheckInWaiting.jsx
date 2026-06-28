import React from 'react';

export default function CheckInWaiting({ t, meuRegisto }) {
  return (
    <div className="checkin-waiting-container">
      <div className="checkin-waiting-alert">
        <span className="checkin-lock-icon">🔒</span>
        <p>{t.daily_check_waiting_partner || 'A aguardar que o teu amor responda para revelar...'}</p>
      </div>
      
      <div className="checkin-comparison-grid">
        {/* O Meu Card */}
        <div className="answer-card user-card">
          <h5>{t.daily_check_me || 'A tua resposta:'}</h5>
          <div className="answer-bubble">
            <span className="quote-mark">“</span>
            <p>{meuRegisto?.answerText}</p>
          </div>
        </div>

        {/* Card do Parceiro Bloqueado */}
        <div className="answer-card partner-card locked-state">
          <h5>{t.daily_check_partner || 'Resposta do teu amor:'}</h5>
          <div className="answer-bubble blurred-bubble">
            <span className="quote-mark">“</span>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec arcu ac lorem efficitur aliquet.</p>
          </div>
          <div className="blur-overlay">
            <span>💭 {t.daily_check_waiting_partner_short || 'Segredo...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
