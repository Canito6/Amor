import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

const MOOD_EMOJIS_LIST = ['😊', '🥰', '😢', '😡', '😴', '😷', '🧠', '❤️', '😱'];

export default function LetterCreator({
  onClose,
  onSubmit,
  creating,
  language,
  t
}) {
  const { showToast } = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [conditionType, setConditionType] = useState('instant'); // 'instant' | 'date' | 'mood'
  const [conditionValue, setConditionValue] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showToast(language === 'pt' ? 'Preenche o título e o conteúdo da carta!' : 'Fill in the letter title and content!', 'error');
      return;
    }

    if (conditionType !== 'instant' && !conditionValue) {
      showToast(language === 'pt' ? 'Define o valor da condição (data ou humor)!' : 'Define the condition value (date or mood)!', 'error');
      return;
    }

    onSubmit(newTitle, newContent, conditionType, conditionValue);
  };

  return (
    <div className="letter-modal-backdrop fade-in">
      <div className="glass-panel letter-creator-modal">
        <div className="modal-header">
          <h3>✉️ {t.letter_create_title || 'Escrever Carta Surpresa'}</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="input-label" htmlFor="letterTitle">{t.letter_input_title || 'Título'}</label>
            <input
              id="letterTitle"
              type="text"
              placeholder="Ex: Abrir quando te sentires triste"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-control"
              required
              maxLength={80}
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="letterContent">{t.letter_input_content || 'Conteúdo da Carta'}</label>
            <textarea
              id="letterContent"
              placeholder="Querido(a), se estás a ler isto é porque precisas de um carinho..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="input-control textarea-control"
              required
              maxLength={1500}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label className="input-label">{t.letter_input_cond_type || 'Regra de Abertura'}</label>
            <div className="condition-types-row">
              <button
                type="button"
                className={`btn-cond-select ${conditionType === 'instant' ? 'active' : ''}`}
                onClick={() => { setConditionType('instant'); setConditionValue(''); }}
              >
                🚀 {t.letter_cond_instant || 'Imediata'}
              </button>
              <button
                type="button"
                className={`btn-cond-select ${conditionType === 'date' ? 'active' : ''}`}
                onClick={() => { setConditionType('date'); setConditionValue(''); }}
              >
                📅 {t.letter_cond_date || 'Data'}
              </button>
              <button
                type="button"
                className={`btn-cond-select ${conditionType === 'mood' ? 'active' : ''}`}
                onClick={() => { setConditionType('mood'); setConditionValue(''); }}
              >
                😊 {t.letter_cond_mood || 'Humor'}
              </button>
            </div>
          </div>

          {conditionType === 'date' && (
            <div className="form-group slide-down">
              <label className="input-label" htmlFor="letterDateVal">Qual a data de abertura?</label>
              <input
                id="letterDateVal"
                type="date"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="input-control"
                required
              />
            </div>
          )}

          {conditionType === 'mood' && (
            <div className="form-group slide-down">
              <label className="input-label">Qual o humor necessário do parceiro?</label>
              <div className="mood-select-grid">
                {MOOD_EMOJIS_LIST.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className={`mood-select-btn ${conditionValue === emoji ? 'selected' : ''}`}
                    onClick={() => setConditionValue(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-buttons-row">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? '...' : (t.letter_btn_create || 'Enviar')}
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
