

export default function PostItEditForm({
  editContent,
  setEditContent,
  cores,
  handleSave,
  handleCancel,
  t
}) {
  return (
    <div className="post-it-edit-area">
      <textarea
        className="post-it-edit-input"
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        rows={4}
        autoFocus
        style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderColor: cores.border }}
      />
      <div className="post-it-edit-actions">
        <button className="btn btn-primary post-it-edit-btn" onClick={handleSave}>
          💾 {t.save}
        </button>
        <button className="btn btn-dark post-it-edit-btn" onClick={handleCancel}>
          ✕ {t.cancel}
        </button>
      </div>
    </div>
  );
}
