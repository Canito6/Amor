import React from 'react';

export default function LikelyQuestionCard({
  q,
  meuNome,
  minhaRole,
  partnerName,
  onVote,
  onDelete,
  language,
  t
}) {
  const getIsQuestionCompleted = (q) => q.votes.length === 2;
  const getHasUserVoted = (q) => q.votes.some(v => v.voter === meuNome);

  const isCompleted = getIsQuestionCompleted(q);
  const userVoted = getHasUserVoted(q);

  return (
    <div 
      className={`glass-panel likely-card ${isCompleted ? (q.isMatched ? 'match' : 'miss') : ''}`}
    >
      {/* Delete Button */}
      {(q.createdBy === meuNome || minhaRole === 'admin') && (
        <button 
          className="likely-delete-btn"
          onClick={(e) => onDelete(e, q._id)}
          title={t.likely_confirm_delete}
        >
          ✕
        </button>
      )}

      <div className="likely-card-content">
        <h3 className="likely-question-text">{q.text}</h3>

        {isCompleted ? (
          /* COMPLETED STATE */
          <div className="likely-result-section">
            <div className="result-badge">
              {q.isMatched ? (
                <span className="badge-match">{t.likely_completed_matched || 'É um Match! 💖'}</span>
              ) : (
                <span className="badge-miss">{t.likely_completed_missed || 'Votos Diferentes 🙈'}</span>
              )}
            </div>

            <div className="result-details">
              <p className="result-detail-text">
                {t.likely_result_detail
                  ? t.likely_result_detail
                      .replace('{v1}', q.votes.find(v => v.voter === meuNome)?.votedFor)
                      .replace('{v2}', q.votes.find(v => v.voter !== meuNome)?.votedFor)
                  : `Tu votaste em ${q.votes.find(v => v.voter === meuNome)?.votedFor} e o parceiro em ${q.votes.find(v => v.voter !== meuNome)?.votedFor}`}
              </p>
            </div>
          </div>
        ) : (
          /* ACTIVE / VOTING STATE */
          <div className="likely-voting-section">
            {userVoted ? (
              <p className="voted-status-waiting">
                {t.likely_voted_status || 'Já votaste! Aguarda o teu amor... ⏳'}
              </p>
            ) : (
              <div className="voting-action-row">
                <p className="vote-status-prompt">
                  {t.likely_not_voted_status || 'Falta o teu voto! Quem é?'}
                </p>
                <div className="vote-buttons">
                  <button 
                    className="btn btn-primary btn-vote"
                    onClick={() => onVote(q._id, 'me')}
                  >
                    🙋 {t.likely_vote_me || 'Eu!'}
                  </button>
                  <button 
                    className="btn btn-dark btn-vote"
                    onClick={() => onVote(q._id, 'partner')}
                  >
                    💑 {t.likely_vote_partner || 'O meu amor!'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
