import React, { useState } from 'react';

export default function NoteCreator({
  onClose,
  onSubmit,
  creating,
  t
}) {
  const [newContent, setNewContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('miminho'); // 'miminho' | 'piada' | 'recordacao'

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newContent.trim()) {
      alert(t.jar_input_content || 'O conteúdo do papelinho é obrigatório!');
      return;
    }
    onSubmit(newContent, selectedCategory);
  };

  return (
    <div className="jar-modal-backdrop fade-in">
      <div className="glass-panel jar-creator-modal">
        <div className="modal-header">
          <h3>🏺 {t.jar_create_title || 'Colocar Papelinho'}</h3>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="input-label" htmlFor="jarContent">{t.jar_input_content || 'A tua mensagem'}</label>
            <textarea
              id="jarContent"
              placeholder="Escreve um elogio, piada nossa ou uma boa memória..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="input-control textarea-control"
              required
              maxLength={180}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="input-label">{t.jar_input_category || 'Categoria'}</label>
            <div className="category-select-row">
              <button
                type="button"
                className={`cat-btn ${selectedCategory === 'miminho' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('miminho')}
              >
                💖 {t.jar_cat_miminho ? t.jar_cat_miminho.split(' ')[0] : 'Miminho'}
              </button>
              <button
                type="button"
                className={`cat-btn ${selectedCategory === 'piada' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('piada')}
              >
                🤫 {t.jar_cat_piada ? t.jar_cat_piada.split(' ')[0] : 'Piada'}
              </button>
              <button
                type="button"
                className={`cat-btn ${selectedCategory === 'recordacao' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('recordacao')}
              >
                ⏳ {t.jar_cat_recordacao ? t.jar_cat_recordacao.split(' ')[0] : 'Recordação'}
              </button>
            </div>
          </div>

          <div className="form-buttons-row">
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? '...' : (t.jar_btn_create || 'Guardar')}
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
