import { useRef, useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

export default function useCanvasDrawing(drawTemplate) {
  const socket = useSocket();
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
  }, [activeTemplate, drawTemplate]);

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

  return {
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
  };
}
