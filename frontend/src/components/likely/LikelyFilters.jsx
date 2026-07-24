

export default function LikelyFilters({
  filter,
  setFilter,
  totalCount,
  activeCount,
  completedCount,
  language,
  t
}) {
  return (
    <div className="likely-filters glass-panel">
      <button 
        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        onClick={() => setFilter('all')}
      >
        {t.coupon_filter_all || 'Todos'} ({totalCount})
      </button>
      <button 
        className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
        onClick={() => setFilter('active')}
      >
        {language === 'pt' ? 'Ativos' : 'Active'} ({activeCount})
      </button>
      <button 
        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
        onClick={() => setFilter('completed')}
      >
        {t.letter_status_opened ? t.letter_status_opened.split(' ')[0] : 'Completos'} ({completedCount})
      </button>
    </div>
  );
}
