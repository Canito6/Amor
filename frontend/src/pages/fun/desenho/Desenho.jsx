import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../context/SocketContext';
import { usePreferences } from '../../../context/PreferencesContext';
import { translations } from '../../../services/common/translations';
import QuadroCanvas from './components/QuadroCanvas';
import QuadroControls from './components/QuadroControls';
import QuadroSettings from './components/QuadroSettings';
import './Desenho.css';

// Templates de fundo premium
const TEMPLATES = [
  { id: 'branco', label: 'Em Branco ⚪' },
  { id: 'galo', label: 'Jogo do Galo ❌⭕' },
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
  { value: '#ffffff', name: 'Borracha 🧽' } // Branco serve de borracha
];

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

  // Histórico de estados para Undo / Redo
  const [historyStack, setHistoryStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState('branco');

  const drawTemplate = (templateName, width, height, ctx) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (templateName === 'galo') {
      ctx.strokeStyle = 'rgba(255, 77, 109, 0.3)'; // Rosa suave
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Linhas verticais
      ctx.moveTo(width / 3, 20);
      ctx.lineTo(width / 3, height - 20);
      ctx.moveTo((width * 2) / 3, 20);
      ctx.lineTo((width * 2) / 3, height - 20);
      // Linhas horizontais
      ctx.moveTo(20, height / 3);
      ctx.lineTo(width - 20, height / 3);
      ctx.moveTo(20, (height * 2) / 3);
      ctx.lineTo(width - 20, (height * 2) / 3);
      ctx.stroke();
      ctx.closePath();
    } else if (templateName === 'coracao') {
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
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
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
      
      // Desenhar o template ativo
      drawTemplate(activeTemplate, canvas.width, canvas.height, context);

      setHistoryStack([canvas.toDataURL()]);
      setRedoStack([]);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [activeTemplate]);

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

      setHistoryStack(prev => [...prev, canvas.toDataURL()]);
      setRedoStack([]);

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    const handlePartnerUpdateCanvasImage = (data) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      setHistoryStack(prev => [...prev, canvas.toDataURL()]);
      setRedoStack([]);

      const img = new Image();
      img.src = data.imageData;
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
    };

    socket.on('partner-draw-line', handlePartnerDrawLine);
    socket.on('partner-clear-canvas', handlePartnerClearCanvas);
    socket.on('partner-update-canvas-image', handlePartnerUpdateCanvasImage);

    return () => {
      socket.off('partner-draw-line', handlePartnerDrawLine);
      socket.off('partner-clear-canvas', handlePartnerClearCanvas);
      socket.off('partner-update-canvas-image', handlePartnerUpdateCanvasImage);
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

    // Guardar estado atual no histórico antes do novo traço
    const canvas = canvasRef.current;
    if (canvas) {
      setHistoryStack(prev => [...prev, canvas.toDataURL()]);
      setRedoStack([]);
    }

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

    // Guardar estado no histórico antes de limpar
    setHistoryStack(prev => [...prev, canvas.toDataURL()]);
    setRedoStack([]);

    // Limpar localmente
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Emitir para parceiro
    if (socket) {
      socket.emit('clear-canvas', { room: coupleId });
    }
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Pop anterior e puxar o atual para o redo
    const previousState = historyStack[historyStack.length - 1];
    setRedoStack(prev => [...prev, canvas.toDataURL()]);
    setHistoryStack(prev => prev.slice(0, -1));

    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Emitir imagem completa para sincronizar
      if (socket) {
        socket.emit('update-canvas-image', { room: coupleId, imageData: previousState });
      }
    };
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setHistoryStack(prev => [...prev, canvas.toDataURL()]);

    const img = new Image();
    img.src = nextState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      if (socket) {
        socket.emit('update-canvas-image', { room: coupleId, imageData: nextState });
      }
    };
  };

  const handleSelectTemplate = (templateId) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    setHistoryStack(prev => [...prev, canvas.toDataURL()]);
    setRedoStack([]);
    setActiveTemplate(templateId);

    drawTemplate(templateId, canvas.width, canvas.height, context);

    if (socket) {
      socket.emit('update-canvas-image', { room: coupleId, imageData: canvas.toDataURL() });
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `quadro-do-amor-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
