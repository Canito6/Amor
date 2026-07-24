import { useEffect, useState } from 'react';
import { decisionWheelService } from '../../services/fun/decisionWheelService';
import { playClickSound, triggerHaptic } from '../../utils/media/audioHelper';
import { sounds } from '../../utils/ui/soundEffects';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { triggerVictoryConfetti } from '../../utils/confettiUtils';

export default function useRoleta(t) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [wheels, setWheels] = useState([]);
  const [selectedWheel, setSelectedWheel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Creation form states
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);
  const [creating, setCreating] = useState(false);

  // Spinning states
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);

  const carregarRoletas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await decisionWheelService.getDecisionWheels();
      setWheels(data);
      if (data.length > 0) {
        setSelectedWheel(data[0]);
      }
    } catch {
      setError(t.wheel_error_load || 'Erro ao carregar roletas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRoletas();
  }, []);

  const handleCreateWheel = async (e) => {
    e.preventDefault();
    const validOptions = newOptions.map(opt => opt.trim()).filter(opt => opt !== '');
    if (!newTitle.trim() || validOptions.length < 2) {
      showToast(t.wheel_empty_options_alert || 'Adiciona pelo menos 2 opções!', 'error');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const newWheel = await decisionWheelService.createDecisionWheel({
        title: newTitle.trim(),
        options: validOptions
      });
      setWheels([newWheel, ...wheels]);
      setSelectedWheel(newWheel);
      setNewTitle('');
      setNewOptions(['', '']);
      setShowCreator(false);
      showToast(t.wheel_success_created || 'Roleta criada!', 'success');
    } catch {
      setError(t.wheel_error_save || 'Erro ao criar roleta.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWheel = async (id) => {
    const ok = await confirm({
      title: t.wheel_confirm_delete || 'Apagar roleta?',
      message: t.wheel_confirm_delete || 'Tens a certeza que queres apagar esta roleta?',
      confirmText: t.delete || 'Apagar',
      cancelText: t.cancel || 'Cancelar',
    });
    if (!ok) return;
    try {
      setError('');
      await decisionWheelService.deleteDecisionWheel(id);
      const remaining = wheels.filter(w => w._id !== id);
      setWheels(remaining);
      setSelectedWheel(remaining.length > 0 ? remaining[0] : null);
    } catch {
      setError(t.wheel_error_delete || 'Erro ao apagar roleta.');
    }
  };

  const handleAddOptionField = () => {
    setNewOptions([...newOptions, '']);
  };

  const handleRemoveOptionField = (index) => {
    if (newOptions.length <= 2) return;
    setNewOptions(newOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  // Spin the wheel logic
  const spinWheel = () => {
    if (isSpinning || !selectedWheel || selectedWheel.options.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    const options = selectedWheel.options;
    const sliceAngle = 360 / options.length;

    // Adivinhar o vencedor antes de girar
    const selectedIndex = Math.floor(Math.random() * options.length);
    
    // Cálculo para parar exatamente na fatia selecionada
    // Queremos que a fatia pare alinhada com a seta superior (0 graus / 12h)
    const targetAngle = 360 - (selectedIndex * sliceAngle + sliceAngle / 2);
    
    // Rotação total: pelo menos 5 rotações completas mais o ângulo do vencedor
    const spinsCount = 6;
    const totalRotation = 360 * spinsCount + targetAngle;
    
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReducedMotion) {
      setRotation(targetAngle);
      setTimeout(() => {
        setIsSpinning(false);
        setResult(options[selectedIndex]);
        triggerHaptic(100);
        sounds.playChime();
      }, 100);
      return;
    }

    setRotation(totalRotation);

    // Efeito sonoro dinâmico durante a desaceleração da roleta
    let ticks = 0;
    const duration = 4000; // ms
    const startTime = performance.now();

    const animateTicks = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = 1 - Math.pow(1 - progress, 3); 
      const currentRotation = easeProgress * totalRotation;
      
      const currentTickIndex = Math.floor(currentRotation / sliceAngle);
      if (currentTickIndex > ticks) {
        ticks = currentTickIndex;
        playClickSound();
      }

      if (progress < 1) {
        requestAnimationFrame(animateTicks);
      }
    };

    requestAnimationFrame(animateTicks);

    // Finalizar após a animação de 4 segundos terminar
    setTimeout(() => {
      setIsSpinning(false);
      setResult(options[selectedIndex]);
      triggerHaptic(100); // Vibração de parada/sucesso!
      sounds.playChime();
      triggerVictoryConfetti();
    }, duration);
  };

  return {
    wheels,
    selectedWheel,
    setSelectedWheel,
    loading,
    error,
    setError,
    showCreator,
    setShowCreator,
    newTitle,
    setNewTitle,
    newOptions,
    setNewOptions,
    creating,
    isSpinning,
    rotation,
    result,
    handleCreateWheel,
    handleDeleteWheel,
    handleAddOptionField,
    handleRemoveOptionField,
    handleOptionChange,
    spinWheel
  };
}
