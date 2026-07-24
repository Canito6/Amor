

export default function LetterFilters({
  filter,
  setFilter,
  totalLetters,
  readyCount,
  lockedCount,
  openedCount,
  language,
  t
}) {
  return (
    <div className="letter-filters glass-panel">
      <button 
        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        onClick={() => setFilter('all')}
      >
        {t.coupon_filter_all || 'Todos'} ({totalLetters})
      </button>
      <button 
        className={`filter-btn ${filter === 'unlocked' ? 'active' : ''}`}
        onClick={() => setFilter('unlocked')}
        title="Cartas prontas a abrir escritas pelo parceiro"
      >
        {language === 'pt' ? 'Prontas a Abrir' : 'Ready to Open'} ({readyCount})
      </button>
      <button 
        className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
        onClick={() => setFilter('locked')}
        title="Cartas com regras de abertura pendentes"
      >
        {language === 'pt' ? 'Bloqueadas' : 'Locked'} ({lockedCount})
      </button>
      <button 
        className={`filter-btn ${filter === 'opened' ? 'active' : ''}`}
        onClick={() => setFilter('opened')}
      >
        {t.letter_status_opened ? t.letter_status_opened.split(' ')[0] : 'Abertas'} ({openedCount})
      </button>
    </div>
  );
}
