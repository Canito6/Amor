import { useEffect, useRef } from 'react';
import { usePreferences } from '../../context/PreferencesContext';

export default function FloatingHeartsBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, speedX: 0 });
  const { globalTheme } = usePreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Lista de corações
    const hearts = [];
    // Limite máximo dependendo do ecrã para evitar lag
    const maxHearts = width < 768 ? 20 : 45;

    // Seleção dinâmica e sazonal das cores das partículas conforme o mês do ano
    const currentMonth = new Date().getMonth(); // 0 a 11
    let heartColors;

    if (currentMonth === 1) {
      // Fevereiro (Dia dos Namorados / Romance)
      heartColors = ['rgba(255, 77, 109, 0.3)', 'rgba(255, 0, 85, 0.25)', 'rgba(255, 117, 143, 0.22)', 'rgba(199, 0, 57, 0.2)'];
    } else if (currentMonth >= 2 && currentMonth <= 4) {
      // Primavera (Março a Maio / Rosas & Flor de Cerejeira)
      heartColors = ['rgba(247, 143, 179, 0.28)', 'rgba(255, 182, 193, 0.25)', 'rgba(255, 105, 180, 0.22)', 'rgba(219, 112, 147, 0.2)'];
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      // Verão (Junho a Agosto / Coral Quente & Sol)
      heartColors = ['rgba(255, 117, 143, 0.26)', 'rgba(255, 154, 162, 0.22)', 'rgba(255, 183, 178, 0.25)', 'rgba(226, 106, 106, 0.2)'];
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      // Outono (Setembro a Novembro / Âmbar Quente & Terracota)
      heartColors = ['rgba(230, 115, 125, 0.25)', 'rgba(212, 91, 107, 0.22)', 'rgba(255, 140, 120, 0.22)', 'rgba(180, 70, 90, 0.2)'];
    } else {
      // Inverno / Dezembro / Janeiro (Ouro Festivo & Prata Violeta)
      heartColors = ['rgba(255, 215, 0, 0.22)', 'rgba(255, 105, 180, 0.22)', 'rgba(186, 85, 211, 0.2)', 'rgba(255, 182, 193, 0.22)'];
    }

    // Criar um coração
    const createHeart = (isInitial = false) => {
      const size = 6 + Math.random() * 16;
      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : height + 30,
        size,
        speedY: 0.4 + Math.random() * 0.8,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        opacity: 0.15 + Math.random() * 0.4,
        wiggle: Math.random() * Math.PI * 2,
        wiggleSpeed: 0.01 + Math.random() * 0.02
      };
    };

    // Inicialização
    for (let i = 0; i < maxHearts; i++) {
      hearts.push(createHeart(true));
    }

    // Desenhar um coração clássico simétrico via curvas Bezier no Canvas
    const drawHeart = (c, x, y, size, color, opacity) => {
      c.save();
      c.globalAlpha = opacity;
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(x, y);
      // Lado esquerdo do coração
      c.bezierCurveTo(x - size / 1.8, y - size / 1.8, x - size * 1.1, y + size / 3, x, y + size * 1.1);
      // Lado direito do coração
      c.bezierCurveTo(x + size * 1.1, y + size / 3, x + size / 1.8, y - size / 1.8, x, y);
      c.closePath();
      c.fill();
      c.restore();
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Rastrear posição horizontal e movimento do rato para criar uma força de vento
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - mouseRef.current.x;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        speedX: Math.max(-10, Math.min(10, deltaX * 0.15))
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Ciclo de Animação
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Desaceleração gradual do efeito de vento do rato
      mouseRef.current.speedX *= 0.95;

      for (let i = 0; i < hearts.length; i++) {
        const h = hearts[i];
        
        // Movimento vertical constante
        h.y -= h.speedY;

        // Efeito de oscilação lateral sinusoidal natural
        h.wiggle += h.wiggleSpeed;
        h.x += Math.sin(h.wiggle) * 0.25;

        // Aplicar a força do vento gerada pelo rato
        h.x += mouseRef.current.speedX * (h.size / 15);

        // Ajustar coordenadas para fazer "wrap" se saírem da janela
        if (h.x < -30) h.x = width + 30;
        else if (h.x > width + 30) h.x = -30;

        // Renderizar o coração
        drawHeart(ctx, h.x, h.y, h.size, h.color, h.opacity);

        // Recriar o coração se sair do ecrã pelo topo
        if (h.y < -30) {
          hearts[i] = createHeart(false);
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    // Iniciar loop
    tick();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [globalTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1, // fica atrás do wrapper de conteúdo mas na frente da cor base de fundo do body
        mixBlendMode: globalTheme === 'dark' ? 'screen' : 'multiply',
        opacity: globalTheme === 'dark' ? 0.35 : 0.45
      }}
    />
  );
}
