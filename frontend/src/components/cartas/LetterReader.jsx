import React from 'react';

export default function LetterReader({
  letter,
  onClose,
  formatDate,
  language,
  t
}) {
  return (
    <div className="letter-modal-backdrop fade-in" onClick={onClose}>
      <div className="glass-panel letter-reader-modal" onClick={e => e.stopPropagation()}>
        <div className="reader-letter-paper">
          <div className="reader-header">
            <h2>✉️ {letter.title}</h2>
            <button className="close-paper-btn" onClick={onClose}>✕</button>
          </div>

          <div className="reader-body">
            <p className="letter-paper-text">{letter.content}</p>
          </div>

          <div className="reader-footer">
            <p className="letter-paper-signature">
              {language === 'pt' ? 'Com amor,' : 'With love,'}<br />
              <strong>{letter.createdBy}</strong>
            </p>
            {letter.openedAt && (
              <span className="opened-stamp-tag">
                {t.letter_opened_by ? t.letter_opened_by.replace('{date}', formatDate(letter.openedAt)) : `Lida em ${formatDate(letter.openedAt)}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
