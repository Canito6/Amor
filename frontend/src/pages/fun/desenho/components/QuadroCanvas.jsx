import React from 'react';

export default function QuadroCanvas({
  canvasRef,
  startDrawing,
  draw,
  stopDrawing
}) {
  return (
    <div className="canvas-wrapper-panel glass-panel">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="drawing-canvas"
      />
    </div>
  );
}
