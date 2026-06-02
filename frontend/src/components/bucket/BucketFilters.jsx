import React from 'react';

export default function BucketFilters({
  filter,
  setFilter,
  items,
  onAddClick,
  loading,
  t
}) {
  const allCount = items.length;
  const pendingCount = items.filter(i => !i.completed).length;
  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="bucket-controls-bar">
      <div className="bucket-filters glass-panel">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t.bucket_filter_all || 'Todos'} ({allCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          {t.bucket_filter_pending || 'Por Cumprir'} ({pendingCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          {t.bucket_filter_completed || 'Cumpridos'} ({completedCount})
        </button>
      </div>

      <button 
        className="btn btn-primary btn-add-bucket" 
        onClick={onAddClick}
        disabled={loading}
      >
        ➕ {t.bucket_create_title || 'Novo Desejo'}
      </button>
    </div>
  );
}
