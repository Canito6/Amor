

export default function QuadroControls({
  handleUndo,
  historyStackLength,
  handleRedo,
  redoStackLength,
  handleExportPNG,
  clearCanvas
}) {
  return (
    <>
      <div className="canvas-history-controls">
        <button 
          onClick={handleUndo} 
          disabled={historyStackLength === 0} 
          className="btn btn-secondary history-btn" 
          title="Desfazer"
        >
          ↩️ Desfazer
        </button>
        <button 
          onClick={handleRedo} 
          disabled={redoStackLength === 0} 
          className="btn btn-secondary history-btn" 
          title="Refazer"
        >
          ↪️ Refazer
        </button>
      </div>

      <button onClick={handleExportPNG} className="btn btn-primary export-canvas-btn">
        💾 Guardar Desenho
      </button>

      <button onClick={clearCanvas} className="btn btn-secondary clear-canvas-btn">
        🗑️ Limpar Tudo
      </button>
    </>
  );
}
