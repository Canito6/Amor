import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const COUPON_ICONS = ['🎟️', '💆', '🍿', '🍽️', '🚗', '🧼', '☕', '🎮', '❤️', '✈️'];

export default function CouponCreator({
  onClose,
  onSubmit,
  creating,
  t
}) {
  const { showToast } = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎟️');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast(t.coupon_input_title || 'O título do vale é obrigatório!', 'error');
      return;
    }
    onSubmit(newTitle, newDescription, selectedIcon);
  };

  return (
    <div className="coupon-modal-backdrop fade-in">
      <div className="glass-panel coupon-creator-modal">
        <div className="modal-header">
          <h3>🎁 {t.coupon_create_title || 'Oferecer Novo Vale'}</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="input-label" htmlFor="couponTitle">{t.coupon_input_title || 'Título'}</label>
            <input
              id="couponTitle"
              type="text"
              placeholder="Ex: Pequeno-almoço na cama"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-control"
              required
              maxLength={60}
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="couponDesc">{t.coupon_input_desc || 'Detalhes'}</label>
            <input
              id="couponDesc"
              type="text"
              placeholder="Ex: Válido para qualquer domingo de manhã"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="input-control"
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label className="input-label">{t.coupon_input_icon || 'Escolhe o Ícone'}</label>
            <div className="icon-selector-grid">
              {COUPON_ICONS.map(ico => (
                <button
                  key={ico}
                  type="button"
                  className={`icon-select-btn ${selectedIcon === ico ? 'selected' : ''}`}
                  onClick={() => setSelectedIcon(ico)}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          <div className="form-buttons-row">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? '...' : (t.coupon_btn_create || 'Oferecer')}
            </button>
            <button type="button" className="btn btn-dark" onClick={onClose}>
              {t.cancel || 'Cancelar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
