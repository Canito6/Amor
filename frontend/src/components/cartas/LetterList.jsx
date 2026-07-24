
import LetterCard from './LetterCard';

export default function LetterList({
  loading,
  filteredLetters,
  meuNome,
  minhaRole,
  checkIsLocked,
  openingId,
  onOpen,
  onDelete,
  formatDate,
  language,
  t
}) {
  if (loading) {
    return (
      <div className="letter-loading-spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (filteredLetters.length === 0) {
    return (
      <div className="glass-panel empty-letter-state">
        <p>{t.letter_empty_state || 'Nenhuma carta surpresa encontrada.'}</p>
      </div>
    );
  }

  return (
    <div className="letter-grid fade-in">
      {filteredLetters.map(letter => (
        <LetterCard
          key={letter._id}
          letter={letter}
          meuNome={meuNome}
          minhaRole={minhaRole}
          isLocked={checkIsLocked(letter)}
          isOpening={openingId === letter._id}
          onOpen={onOpen}
          onDelete={onDelete}
          formatDate={formatDate}
          language={language}
          t={t}
        />
      ))}
    </div>
  );
}
