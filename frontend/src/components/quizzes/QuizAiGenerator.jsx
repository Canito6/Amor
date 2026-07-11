import React, { useState } from 'react';

export default function QuizAiGenerator({
  generatingAI,
  handleGenerateAI,
  t
}) {
  const [aiTheme, setAiTheme] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!aiTheme.trim() || generatingAI) return;
    handleGenerateAI(aiTheme);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color-secondary)' }}>
        🤖 {t.quizzes_ai_generate_btn}
      </span>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <input
          type="text"
          placeholder={t.quizzes_ai_theme_placeholder}
          value={aiTheme}
          onChange={(e) => setAiTheme(e.target.value)}
          className="input-control"
          style={{ flex: 1, margin: 0 }}
          disabled={generatingAI}
        />
        <button 
          type="submit"
          className="btn btn-dark" 
          disabled={generatingAI || !aiTheme.trim()}
          style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '150px' }}
        >
          {generatingAI ? t.quizzes_ai_generating : t.quizzes_ai_btn_generate}
        </button>
      </form>

      {/* Categorias Rápidas */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '5px' }}>
        {['Romântico 💖', 'Engraçado 🤪', 'Futuro 🔮', 'Geral 🧠'].map((cat) => {
          const cleanName = cat.split(' ')[0];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleGenerateAI(cleanName)}
              disabled={generatingAI}
              className="quizzes-quick-cat-btn"
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
