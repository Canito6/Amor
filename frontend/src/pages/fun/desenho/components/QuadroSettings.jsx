import React from 'react';

export default function QuadroSettings({
  colors,
  color,
  setColor,
  brushSize,
  setBrushSize,
  templates,
  activeTemplate,
  handleSelectTemplate
}) {
  return (
    <>
      <h3>Paleta de Cores</h3>
      <div className="colors-grid">
        {colors.map((c) => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            style={{ backgroundColor: c.value }}
            className={`color-dot ${color === c.value ? 'active' : ''} ${c.value === '#ffffff' ? 'eraser-dot' : ''}`}
            title={c.name}
          />
        ))}
      </div>

      <div className="brush-slider-container">
        <div className="brush-slider-header">
          <span>Espessura do Pincel</span>
          <span 
            className="brush-size-badge" 
            style={{ 
              width: `${brushSize + 10}px`, 
              height: `${brushSize + 10}px`, 
              backgroundColor: color 
            }} 
          />
        </div>
        <input
          type="range"
          min="2"
          max="24"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="brush-slider"
        />
      </div>

      <div className="template-selector-container">
        <h3>Fundo do Quadro</h3>
        <div className="templates-buttons-grid">
          {templates.map((tmp) => (
            <button
              key={tmp.id}
              onClick={() => handleSelectTemplate(tmp.id)}
              className={`btn-template-select ${activeTemplate === tmp.id ? 'active' : ''}`}
            >
              {tmp.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
