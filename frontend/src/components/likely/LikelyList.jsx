
import LikelyQuestionCard from './LikelyQuestionCard';

export default function LikelyList({
  loading,
  filteredQuestions,
  meuNome,
  minhaRole,
  partnerName,
  onVote,
  onDelete,
  language,
  t
}) {
  if (loading) {
    return (
      <div className="likely-loading-spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="glass-panel empty-likely-state">
        <p>{t.likely_empty_state || 'Nenhuma pergunta adicionada.'}</p>
      </div>
    );
  }

  return (
    <div className="likely-grid fade-in">
      {filteredQuestions.map(q => (
        <LikelyQuestionCard
          key={q._id}
          q={q}
          meuNome={meuNome}
          minhaRole={minhaRole}
          partnerName={partnerName}
          onVote={onVote}
          onDelete={onDelete}
          language={language}
          t={t}
        />
      ))}
    </div>
  );
}
