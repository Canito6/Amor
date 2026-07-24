

export default function LetterCard({
  letter,
  meuNome,
  minhaRole,
  isLocked,
  isOpening,
  onOpen,
  onDelete,
  formatDate,
  language,
  t
}) {
  const isCreator = letter.createdBy === meuNome;

  return (
    <div 
      className={`envelope-card ${isLocked ? 'locked' : ''} ${letter.isOpened ? 'opened' : 'sealed'}`}
      onClick={() => !isLocked && onOpen(letter)}
    >
      {/* Delete Button */}
      {(isCreator || minhaRole === 'admin') && (
        <button 
          className="letter-delete-btn"
          onClick={(e) => onDelete(e, letter._id)}
          title={t.letter_confirm_delete}
        >
          ✕
        </button>
      )}

      <div className="envelope-flap"></div>
      <div className="envelope-pocket"></div>

      <div className="envelope-content">
        <h3 className="envelope-title">{letter.title}</h3>
        <span className="envelope-author">
          {t.letter_written_by || 'Escrita por: '} {letter.createdBy}
        </span>

        {isLocked && (
          <div className="envelope-lock-info">
            <span className="lock-icon">🔒</span>
            <p className="lock-condition">
              {letter.conditionType === 'date' 
                ? `${language === 'pt' ? 'Abrir a:' : 'Open on:'} ${formatDate(letter.conditionValue)}`
                : `${language === 'pt' ? 'Abrir com humor:' : 'Open with mood:'} ${letter.conditionValue}`}
            </p>
          </div>
        )}

        {!isLocked && !letter.isOpened && (
          <div className="envelope-unlock-info">
            <span className="unlock-icon glow-effect">🔓</span>
            <p className="unlock-prompt">
              {isOpening ? '...' : (t.letter_open_btn || 'Ler Carta')}
            </p>
          </div>
        )}

        {letter.isOpened && (
          <span className="read-date-tag">
            📖 {t.letter_opened_by ? t.letter_opened_by.replace('{date}', formatDate(letter.openedAt)) : `Lida em ${formatDate(letter.openedAt)}`}
          </span>
        )}
      </div>

      {/* Wax Seal on Sealed Envelopes */}
      {!letter.isOpened && (
        <div className={`wax-seal ${isOpening ? 'breaking' : ''} ${!isLocked ? 'unlocked glow' : ''}`}>
          <span className="seal-heart">❤️</span>
        </div>
      )}
    </div>
  );
}
