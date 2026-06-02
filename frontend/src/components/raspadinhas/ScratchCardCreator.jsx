import React, { useState } from 'react';

export default function ScratchCardCreator({ onSubmit, onClose, t }) {
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !reward.trim()) return;
    try {
      setCreating(true);
      await onSubmit(title.trim(), reward.trim());
      setTitle('');
      setReward('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="glass-panel scratch-creator-form fade-in">
      <div className="creator-form-header">
        <h3>✍️ {t.scratch_create_title}</h3>
        <button className="close-creator-btn" onClick={onClose}>✕</button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="input-label" htmlFor="scratchTitle">{t.scratch_input_title}</label>
          <input
            id="scratchTitle"
            type="text"
            placeholder={t.scratch_placeholder_title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-control"
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="input-label" htmlFor="scratchReward">{t.scratch_input_reward}</label>
          <textarea
            id="scratchReward"
            placeholder={t.scratch_placeholder_reward}
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            className="input-control"
            required
            rows={3}
            maxLength={500}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-buttons-row">
          <button type="submit" className="btn btn-primary" disabled={creating}>
            {creating ? '...' : (t.scratch_btn_create || 'Criar')}
          </button>
          <button type="button" className="btn btn-dark" onClick={onClose}>
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
