import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function LikelyQuestionCreator({
  onClose,
  onSubmit,
  creating,
  t
}) {
  const { showToast } = useToast();
  const [newText, setNewText] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newText.trim()) {
      showToast(t.likely_input_text || 'O texto da pergunta é obrigatório!', 'error');
      return;
    }
    onSubmit(newText);
  };

  return (
    <div className="likely-modal-backdrop fade-in">
      <div className="glass-panel likely-creator-modal">
        <div className="modal-header">
          <h3>🃏 {t.likely_create_title || 'Nova Pergunta de Sintonia'}</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="input-label" htmlFor="questionText">{t.likely_input_text || 'Pergunta'}</label>
            <input
              id="questionText"
              type="text"
              placeholder="Ex: Quem é mais provável de se esquecer das chaves?"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="input-control"
              required
              maxLength={120}
            />
          </div>

          <div className="form-buttons-row">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? '...' : (t.likely_btn_create || 'Adicionar')}
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
