import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import QuadroCanvas from './components/QuadroCanvas';
import QuadroControls from './components/QuadroControls';
import QuadroSettings from './components/QuadroSettings';
import useCanvasDrawing from '../../../hooks/fun/useCanvasDrawing';
import './Desenho.css';

// Templates de fundo premium (sem o Jogo do Galo, que agora tem página dedicada)
const TEMPLATES = [
  { id: 'branco', label: 'Em Branco ⚪' },
  { id: 'coracao', label: 'Colorir Coração ❤️' },
  { id: 'quadricula', label: 'Quadrícula 🗺️' }
];

// Paleta de cores premium
const COLORS = [
  { value: '#ff4d6d', name: 'Rosa Mimo' },
  { value: '#ff0a54', name: 'Vermelho Paixão' },
  { value: '#7209b7', name: 'Roxo Magia' },
  { value: '#3f37c9', name: 'Azul Sonho' },
  { value: '#4cc9f0', name: 'Turquesa' },
  { value: '#2a9d8f', name: 'Verde Carinho' },
  { value: '#ff9f1c', name: 'Laranja Sol' },
  { value: '#2b2d42', name: 'Preto' },
  { value: '#ffffff', name: 'Borracha 🧽' }
];

const drawTemplate = (templateName, width, height, ctx) => {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  if (templateName === 'coracao') {
    ctx.strokeStyle = 'rgba(255, 77, 109, 0.25)';
    ctx.lineWidth = 5;
    ctx.fillStyle = 'rgba(255, 77, 109, 0.03)';
    ctx.beginPath();
    const cx = width / 2;
    const cy = height / 2 + 10;
    const size = Math.min(width, height) * 0.7;
    ctx.moveTo(cx, cy - size / 4);
    ctx.bezierCurveTo(cx - size / 2, cy - size / 1.5, cx - size, cy - size / 3, cx, cy + size / 2.2);
    ctx.bezierCurveTo(cx + size, cy - size / 3, cx + size / 2, cy - size / 1.5, cx, cy - size / 4);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  } else if (templateName === 'quadricula') {
    ctx.strokeStyle = 'rgba(255, 107, 157, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const step = 25;
    for (let x = step; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = step; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
    ctx.closePath();
  }
};

export default function Desenho() {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const t = translations[language];

  const {
    canvasRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    historyStack,
    redoStack,
    activeTemplate,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    handleUndo,
    handleRedo,
    handleSelectTemplate,
    handleExportPNG
  } = useCanvasDrawing(drawTemplate);

  return (
    <div className="app-container fade-in">
      <div className="page-header-row">
        <button className="btn btn-dark" onClick={() => navigate('/jogos')}>
          ⬅ {t.games_title || 'Jogos'}
        </button>
        <h1 className="page-title">Quadro do Amor ✍️</h1>
        <div className="page-header-spacer"></div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>
        Desenha algo fofo ou deixa uma mensagem no quadro em tempo real com o teu amor! 🎨
      </p>

      <div className="canvas-layout">
        <QuadroCanvas 
          canvasRef={canvasRef}
          startDrawing={startDrawing}
          draw={draw}
          stopDrawing={stopDrawing}
        />

        <div className="canvas-toolbox glass-panel">
          <QuadroSettings 
            colors={COLORS}
            color={color}
            setColor={setColor}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            templates={TEMPLATES}
            activeTemplate={activeTemplate}
            handleSelectTemplate={handleSelectTemplate}
          />

          <QuadroControls 
            handleUndo={handleUndo}
            historyStackLength={historyStack.length}
            handleRedo={handleRedo}
            redoStackLength={redoStack.length}
            handleExportPNG={handleExportPNG}
            clearCanvas={clearCanvas}
          />
        </div>
      </div>
    </div>
  );
}
