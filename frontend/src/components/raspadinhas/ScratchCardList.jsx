
import ScratchCardItem from './ScratchCardItem';

export default function ScratchCardList({
  loading,
  activeTab,
  pendingCards,
  scratchedCards,
  createdCards,
  t,
  language,
  setScratchingCard,
  handleDeleteCard
}) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const renderCards = (cardsList, emptyMessage) => {
    if (cardsList.length === 0) {
      return (
        <div className="glass-panel empty-tab-panel">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return cardsList.map(card => (
      <ScratchCardItem
        key={card._id}
        card={card}
        activeTab={activeTab}
        t={t}
        language={language}
        onScratch={setScratchingCard}
        onDelete={handleDeleteCard}
      />
    ));
  };

  return (
    <div className="scratch-cards-grid fade-in">
      {activeTab === 'pending' && renderCards(pendingCards, t.scratch_empty_pending)}
      {activeTab === 'scratched' && renderCards(scratchedCards, t.scratch_empty_scratched)}
      {activeTab === 'created' && renderCards(createdCards, t.scratch_empty_created)}
    </div>
  );
}
