import React from 'react';

export default function BucketCard({
  item,
  meuNome,
  minhaRole,
  onDelete,
  onToggleComplete,
  formatDate,
  language,
  t
}) {
  return (
    <div className={`glass-panel bucket-card ${item.completed ? 'completed' : ''}`}>
      {/* Delete Button */}
      {(item.createdBy === meuNome || minhaRole === 'admin') && (
        <button 
          className="bucket-card-delete-btn"
          onClick={(e) => onDelete(e, item._id)}
          title={t.bucket_confirm_delete}
        >
          ✕
        </button>
      )}

      {/* Polaroid Photo Frame if completed with photo */}
      {item.completed && item.imageUrl && (
        <div className="bucket-polaroid-frame">
          <img src={item.imageUrl} alt={item.title} className="bucket-polaroid-image" loading="lazy" />
          <div className="polaroid-pin">📌</div>
        </div>
      )}

      <div className="bucket-card-content">
        <div className="bucket-card-header">
          <h3 className="bucket-card-title">{item.title}</h3>
          <div 
            onClick={() => onToggleComplete(item)}
            className={`bucket-checkbox ${item.completed ? 'checked' : ''}`}
            title={t.bucket_complete_action}
          >
            {item.completed ? '✓' : ''}
          </div>
        </div>

        {item.description && (
          <p className="bucket-card-desc">{item.description}</p>
        )}

        {item.completed ? (
          <div className="bucket-completion-details">
            <p className="completed-info">
              {t.bucket_completed_by
                ? t.bucket_completed_by.replace('{user}', item.completedBy).replace('{date}', formatDate(item.completedAt))
                : `Cumprido por ${item.completedBy} em ${formatDate(item.completedAt)}`}
            </p>
          </div>
        ) : (
          <div className="bucket-pending-details">
            <span className="creator-tag">
              {(t.bucket_created_by || 'Adicionado por:')} {item.createdBy}
            </span>
            <button 
              className="btn btn-primary btn-mini-complete"
              onClick={() => onToggleComplete(item)}
            >
              🏆 {language === 'pt' ? 'Cumprir' : 'Done'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
