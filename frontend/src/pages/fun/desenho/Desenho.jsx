import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import './Desenho.css';

export default function Desenho() {
  const navigate = useNavigate();
  const socket = useSocket();
  const { language } = usePreferences();
  const t = translations[language];

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ff4d6d'); // Cor romântica padrão: Rosa
  const [brushSize, setBrushSize] = useState(5);

  const prevPosRef = useRef({ x: 0, y: 0 });
  const coupleId = localStorage.getItem('coupleId') || '';

  // Paleta de cores premium
  const colors = [
    { value: '#ff4d6d', name: 'Rosa Mimo' },
    { value: '#ff0a54', name: 'Vermelho Paixão' },
    { value: '#7209b7', name: 'Roxo Magia' },
    { value: '#3f37c9', name: 'Azul Sonho' },
    { value: '#4cc9f0', name: 'Turquesa' },
    { value: '#2a9d8f', name: 'Verde Carinho' },
    { value: '#ff9f1c', name: 'Laranja Sol' },
    { value: '#2b2d42', name: 'Preto' },
    { value: '#ffffff', name: 'Borracha 🧽' } // Branco serve de borracha
  ];

  // Configurar o Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fazer o canvas ocupar a largura total do seu wrapper responsivo
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.width * 0.6; // Proporção 5:3
      
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      contextRef.current = context;
      
      // Manter o fundo do canvas branco para permitir borracha
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Ouvintes de Sockets
  useEffect(() => {
    if (!socket) return;

    const handlePartnerDrawLine = (data) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      const w = canvas.width;
      const h = canvas.height;

      // Desconversão de coordenadas percentuais
      const x1 = data.sx * w;
      const y1 = data.sy * h;
      const x2 = data.ex * w;
      const y2 = data.ey * h;

      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = data.color;
      context.lineWidth = data.size;
      context.stroke();
      context.closePath();
    };

    const handlePartnerClearCanvas = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('partner-draw-line', handlePartnerDrawLine);
    socket.on('partner-clear-canvas', handlePartnerClearCanvas);

    return () => {
      socket.off('partner-draw-line', handlePartnerDrawLine);
      socket.off('partner-clear-canvas', handlePartnerClearCanvas);
    };
  }, [socket]);

  // Função para desenhar a linha localmente e emitir
  const drawSegment = (x1, y1, x2, y2) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Desenhar localmente
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.stroke();
    context.closePath();

    // Emitir coordenadas normatizadas (0 a 1) para evitar incompatibilidade de ecrãs
    if (socket) {
      const w = canvas.width;
      const h = canvas.height;
      socket.emit('draw-line', {
        room: coupleId,
        sx: x1 / w,
        sy: y1 / h,
        ex: x2 / w,
        ey: y2 / h,
        color,
        size: brushSize
      });
    }
  };

  // Obter coordenadas de rato/toque
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calcular escala do canvas devido a CSS resize
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Handlers do Canvas
  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    prevPosRef.current = coords;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    drawSegment(prevPosRef.current.x, prevPosRef.current.y, coords.x, coords.y);
    prevPosRef.current = coords;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // Limpar localmente
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Emitir para parceiro
    if (socket) {
      socket.emit('clear-canvas', { room: coupleId });
    }
  };

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
        Desenha algo fofo, joga ao galo ou deixa uma mensagem no quadro em tempo real com o teu amor! 🎨
      </p>

      <div className="canvas-layout">
        {/* Painel do Canvas */}
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

        {/* Caixa de Ferramentas */}
        <div className="canvas-toolbox glass-panel">
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
              <span className="brush-size-badge" style={{ width: `${brushSize + 10}px`, height: `${brushSize + 10}px`, backgroundColor: color }} />
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

          <button onClick={clearCanvas} className="btn btn-secondary clear-canvas-btn">
            🗑️ Limpar Quadro
          </button>
        </div>
      </div>
    </div>
  );
}
