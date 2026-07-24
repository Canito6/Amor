import { useEffect, useState, useRef } from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { playScratchSound, triggerHaptic } from '../../utils/media/audioHelper';
import { sounds } from '../../utils/ui/soundEffects';

// Subcomponente para a animação interactiva de raspagem usando Canvas HTML5 com Confetes Premiados
export default function ScratchLightbox({ card, onClose, onScratchComplete, t }) {
  const { language } = usePreferences();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(card.isScratched);
  const [drawing, setDrawing] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastSoundTimeRef = useRef(0);

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

    // Desenhar a camada protetora metálica Rose Gold
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#ecb8b8'); // Rose Gold brilhante
    grad.addColorStop(0.25, '#ffd9d9');
    grad.addColorStop(0.5, '#d49ea7'); // Tom médio metálico
    grad.addColorStop(0.75, '#ffd9d9');
    grad.addColorStop(1, '#ecb8b8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Adicionar padrão metálico diagonal de brilho
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    for (let i = -height; i < width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // Adicionar texto decorativo sobre a raspadinha
    ctx.font = 'bold 16px "Poppins", sans-serif';
    ctx.fillStyle = '#2D1B2E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Raspa Aqui ❤️', width / 2, height / 2 - 10);

    ctx.font = '12px "Inter", sans-serif';
    ctx.fillStyle = '#6b586e';
    ctx.fillText(t.scratch_canvas_instruction.split('!')[0] + '!', width / 2, height / 2 + 15);

    // Desenhar pequenos sparkles/corações sobre a raspadinha
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 20; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.beginPath();
      ctx.arc(rx, ry, 2 + Math.random() * 3, 0, Math.PI * 2);
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

    // Cores premium e românticas
    const colors = [
      '#FF6B9D', '#C589E8', '#FF8EAD', '#ffd166', 
      '#06d6a0', '#118ab2', '#ffccd5', '#f72585'
    ];
    const shapes = ['rect', 'circle', 'heart'];
    
    const particles = [];
    // Spawnar 140 partículas a partir do centro
    for (let i = 0; i < 140; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      particles.push({
        x: width / 2,
        y: height / 2,
        size: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4, // Explosão ligeiramente para cima
        rotation: Math.random() * 360,
        rotationSpeed: -10 + Math.random() * 20,
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
        p.vy += 0.16; // Gravidade
        p.vx *= 0.98; // Atrito
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'heart') {
          ctx.beginPath();
          const size = p.size;
          ctx.moveTo(0, -size / 4);
          ctx.bezierCurveTo(size / 2, -size / 2, size, 0, 0, size);
          ctx.bezierCurveTo(-size, 0, -size / 2, -size / 2, 0, -size / 4);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        }
        
        ctx.restore();

        // Continua ativo se as partículas ainda estiverem no ecrã
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

    // Tocar som de raspar e vibrar com throttle de 60ms para realismo
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 60) {
      playScratchSound();
      triggerHaptic(20); // Vibração móvel ligeira
      lastSoundTimeRef.current = now;
    }
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
    triggerHaptic(150); // Vibração longa de sucesso!
    sounds.playSparkle();
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
