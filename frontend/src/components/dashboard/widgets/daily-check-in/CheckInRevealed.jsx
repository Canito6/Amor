import React from 'react';
import CheckInForm from './CheckInForm';

export default function CheckInRevealed({
  t,
  meuRegisto,
  parceiroRegisto,
  username,
  onSubmitEdit,
  answerInput,
  setAnswerInput,
  submitting,
  success,
  error
}) {
  return (
    <div className="checkin-revealed-container bounce-in">
      <div className="checkin-revealed-alert">
        <span className="checkin-revealed-icon">🎉</span>
        <p>{t.daily_check_revealed_title || 'As vossas respostas de hoje!'}</p>
      </div>

      <div className="checkin-comparison-grid">
        {/* O Meu Card */}
        <div className="answer-card user-card revealed">
          <h5>{t.daily_check_me || 'A tua resposta:'}</h5>
          <div className="answer-bubble">
            <span className="quote-mark">“</span>
            <p>{meuRegisto?.answerText}</p>
          </div>
          <span className="answer-author">👤 {username}</span>
        </div>

        {/* Card do Parceiro */}
        <div className="answer-card partner-card revealed">
          <h5>{t.daily_check_partner || 'Resposta do teu amor:'}</h5>
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
        <CheckInForm
          onSubmit={onSubmitEdit}
          answerInput={answerInput}
          setAnswerInput={setAnswerInput}
          submitting={submitting}
          error={error}
          success={success}
          t={t}
          isEdit={true}
          originalAnswer={meuRegisto?.answerText}
        />
      </details>
    </div>
  );
}
