// Web Audio API Sound Synthesizer & Haptic Vibration Utility

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Som de "Raspar" (Scratch Sound)
export function playScratchSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Criar buffer de ruído branco (White Noise)
    const bufferSize = ctx.sampleRate * 0.08; // 80ms de duração
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Filtro Passa-Banda para dar textura áspera de papel/fricção
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    // Controlo de Volume (Envelope rápido)
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start();
  } catch (err) {
    console.warn('Audio Context não suportado ou bloqueado:', err);
  }
}

// 2. Som de "Tique" da Roleta (Spin Wheel Tick)
export function playTickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    // Queda exponencial rápida de frequência
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.03);

    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (err) {
    console.warn('Audio Context bloqueado:', err);
  }
}

// 3. Som de toque suave (Tap/Click Sound)
export function playTapSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (err) {
    console.warn('Audio Context bloqueado:', err);
  }
}

// 4. Vibração Háptica
export function triggerHaptic(duration = 40) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (err) {}
  }
}
