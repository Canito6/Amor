import React, { useEffect, useState, useRef } from 'react';
import { usePreferences } from '../../context/PreferencesContext';

// Subcomponente para a animação interactiva de raspagem usando Canvas HTML5 com Confetes Premiados
export default function ScratchLightbox({ card, onClose, onScratchComplete, t }) {
  const { language } = usePreferences();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(card.isScratched);
  const [drawing, setDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Refs de animação de confetes
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Configurar tamanho real do canvas com base no container
    const width = containerRef.current.clientWidth || 320;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    if (isRevealed) {
      // Se já estiver revelado, limpa o canvas (deixa transparente)
      ctx.clearRect(0, 0, width, height);
      return;
    }

    // Desenhar a camada protetora cinzenta/gradiente
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#ccc');
    grad.addColorStop(0.5, '#e0e0e0');
    grad.addColorStop(1, '#aaaaaa');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Adicionar texto decorativo sobre a raspadinha
    ctx.font = 'bold 16px "Comfortaa", "Outfit", sans-serif';
    ctx.fillStyle = '#ff4d6d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Raspa Aqui ❤️', width / 2, height / 2 - 10);

    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = '#555';
    ctx.fillText(t.scratch_canvas_instruction.split('!')[0] + '!', width / 2, height / 2 + 15);

    // Desenhar textura de confetes ou pequenos corações sobre a cartolina cinzenta
    ctx.fillStyle = 'rgba(255, 77, 109, 0.15)';
    for (let i = 0; i < 15; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.beginPath();
      ctx.arc(rx, ry, 3 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [card.isScratched, isRevealed, t.scratch_canvas_instruction]);

  // Limpeza de animação ao desmontar
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Inicializar e rodar animação de confetes
  const startConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;

    // Cores premium de confetes
    const colors = [
      '#ff4d6d', '#ff758f', '#ff8fa3', '#ffd166', 
      '#06d6a0', '#118ab2', '#7209b7', '#f72585'
    ];
    
    const particles = [];
    // Spawnar 120 partículas a partir do centro
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      particles.push({
        x: width / 2,
        y: height / 2,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3, // Força a explosão ligeiramente para cima
        rotation: Math.random() * 360,
        rotationSpeed: -8 + Math.random() * 16,
        opacity: 1
      });
    }
    
    particlesRef.current = particles;

    const runLoop = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);

      let active = false;
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vy += 0.15; // Gravidade
        p.vx *= 0.98; // Resistência do ar

        // Desenhar partícula individual com rotação
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        ctx.restore();

        // Continua ativo se as partículas estiverem no ecrã
        if (p.y < height + 20) {
          active = true;
        }
      });

      if (active) {
        animFrameRef.current = requestAnimationFrame(runLoop);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animFrameRef.current = requestAnimationFrame(runLoop);
  };

  // Função auxiliar para calcular a posição relativa ao Canvas
  const getPointerPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Suporte para Touch (ecrã táctil) ou Rato
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (isRevealed) return;
    e.preventDefault(); // Prevenir scroll no telemóvel ao raspar
    const pos = getPointerPos(e);
    lastPosRef.current = pos;
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing || isRevealed) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPointerPos(e);

    ctx.beginPath();
    // Definir operação para "furar" / apagar o conteúdo cinzento
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 32; // espessura da raspagem
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPosRef.current = pos;
  };

  const stopDrawing = () => {
    if (!drawing || isRevealed) return;
    setDrawing(false);
    checkScratchPercentage();
  };

  // Calcular a percentagem raspada para auto-revelação
  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Ler os pixéis do canvas (otimizado por amostragem de rede)
    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;
    let transparentCount = 0;
    const totalPixels = pixels.length / 4;

    // Verificar o canal Alpha de cada pixel (amostrando a cada 16 pixéis para performance imediata)
    const sampleStep = 16;
    let sampledTotal = 0;
    for (let i = 3; i < pixels.length; i += 4 * sampleStep) {
      sampledTotal++;
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }

    const percentage = (transparentCount / sampledTotal) * 100;
    
    // Se raspou mais de 45%, revela automaticamente
    if (percentage > 45) {
      revealEverything();
    }
  };

  const revealEverything = () => {
    setIsRevealed(true);
    onScratchComplete();
    startConfetti();
  };

  return (
    <div className="scratch-lightbox-overlay" onClick={onClose}>
      <div 
        className="glass-panel scratch-lightbox-content fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button className="close-lightbox-btn" onClick={onClose}>✕</button>
        
        <h2 className="lightbox-card-title">{card.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 15px 0' }}>
          {t.scratch_card_from} <strong>{card.createdBy}</strong>
        </p>

        {/* CONTAINER DA RASPAGEM */}
        <div ref={containerRef} className="scratch-area-container">
          
          {/* Caixa de Texto Revelada (por trás) */}
          <div className="scratch-reward-background">
            <span className="congrats-emoji">🎉🎁</span>
            <h3>{language === 'pt' ? 'Ganhaste!' : 'You Won!'}</h3>
            <p className="scratch-reward-text">"{card.reward}"</p>
          </div>

          {/* Canvas interativo de raspagem (à frente) */}
          <canvas
            ref={canvasRef}
            className="scratch-interactive-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ pointerEvents: isRevealed ? 'none' : 'auto' }}
          />
        </div>

        {/* Instruções / Botões adicionais */}
        {!isRevealed ? (
          <div style={{ marginTop: '15px' }}>
            <p className="scratch-instructions">💡 {t.scratch_canvas_instruction}</p>
            <button className="btn btn-secondary" style={{ marginTop: '10px', width: '100%' }} onClick={revealEverything}>
              {t.scratch_reveal_btn}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>💖 {language === 'pt' ? 'Surpresa Revelada!' : 'Surprise Revealed!'}</p>
            <button className="btn btn-dark" style={{ marginTop: '12px', width: '100%' }} onClick={onClose}>
              {language === 'pt' ? 'Fechar e Concluir' : 'Close and Complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
