import { useEffect, useState } from 'react';
import { memoryService } from '../../services/fun/memoryService';
import { formatDateLong } from '../../utils/formatting/dateFormatter';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import useSocketUpdate from '../shared/useSocketUpdate';

export default function useMemories(t, language) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [memories, setMemories] = useState(() => {
    try {
      const cached = localStorage.getItem('cache_memories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('cache_memories');
    } catch {
      return true;
    }
  });
  const [contadorDias, setContadorDias] = useState(0);
  const [primeiraData, setPrimeiraData] = useState(() => {
    try {
      const cached = localStorage.getItem('cache_memories');
      if (cached) {
        const dados = JSON.parse(cached);
        if (dados.length > 0) {
          const ordenadas = [...dados].sort((a, b) => new Date(a.date) - new Date(b.date));
          return ordenadas[0].date;
        }
      }
    } catch { /* erro silenciado */ }
    return null;
  });
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Estados para edição inline de memórias
  const [editingMemId, setEditingMemId] = useState(null);
  const [editMem, setEditMem] = useState({ title: '', description: '', date: '', isTimeCapsule: false, unlockDate: '', imageUrl: '' });

  const carregarMemoras = async () => {
    try {
      if (memories.length === 0) setLoading(true);
      const dados = await memoryService.getMemories();
      setMemories(dados);
      try {
        localStorage.setItem('cache_memories', JSON.stringify(dados));
      } catch (err) {
        console.warn('Erro ao guardar cache de memórias:', err);
      }

      // Encontrar a memória mais antiga para servir de data de aniversário/início
      if (dados.length > 0) {
        const ordenadas = [...dados].sort((a, b) => new Date(a.date) - new Date(b.date));
        setPrimeiraData(ordenadas[0].date);
      } else {
        setPrimeiraData(null);
      }
    } catch (err) {
      setErro(t.memories_error_load || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMemoras();
  }, []);

  useSocketUpdate(() => {
    carregarMemoras();
  }, ['momento-']);

  // Efeito para atualizar o contador dinâmico de dias juntos
  useEffect(() => {
    if (primeiraData) {
      const dataInicio = new Date(primeiraData);
      const hoje = new Date();
      
      // Diferença em milissegundos
      const diferenca = hoje.getTime() - dataInicio.getTime();
      
      // Converte para dias
      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      setContadorDias(dias > 0 ? dias : 0);
    } else {
      setContadorDias(0);
    }
  }, [primeiraData, memories]);

  const enviarMemoria = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    if (isTimeCapsule && !unlockDate) {
      setErro(t.memories_unlock_error);
      return;
    }

    try {
      setErro('');
      const novaMem = await memoryService.createMemory({ title, description, date, isTimeCapsule, unlockDate, imageUrl });

      // Insere na lista ordenada por data
      const novasMems = [...memories, novaMem].sort((a, b) => new Date(a.date) - new Date(b.date));
      setMemories(novasMems);
      
      // Utiliza primeira data se for a mais antiga
      const ordenadas = [...novasMems].sort((a, b) => new Date(a.date) - new Date(b.date));
      setPrimeiraData(ordenadas[0].date);

      setTitle('');
      setDescription('');
      setDate('');
      setIsTimeCapsule(false);
      setUnlockDate('');
      setImageUrl('');
      showToast(isTimeCapsule ? t.memories_success_lock : t.memories_success_normal, 'success');
    } catch (err) {
      setErro(t.memories_error_save || err.message);
    }
  };

  const apagarMemoria = async (id) => {
    const ok = await confirm({
      title: t.memories_delete_confirm || 'Apagar memória?',
      message: t.memories_delete_confirm || 'Tens a certeza que queres apagar esta memória?',
      confirmText: t.delete || 'Apagar',
      cancelText: t.cancel || 'Cancelar',
    });
    if (!ok) return;

    try {
      setErro('');
      await memoryService.deleteMemory(id);
      const filtradas = memories.filter((m) => m._id !== id);
      setMemories(filtradas);

      if (filtradas.length > 0) {
        const ordenadas = [...filtradas].sort((a, b) => new Date(a.date) - new Date(b.date));
        setPrimeiraData(ordenadas[0].date);
      } else {
        setPrimeiraData(null);
      }
    } catch (err) {
      setErro(t.memories_error_delete || err.message);
    }
  };

  const iniciarEdicaoMemoria = (mem) => {
    setEditingMemId(mem._id);
    setEditMem({
      title: mem.title === 'Cápsula do Tempo Trancada 🔒' ? '' : mem.title,
      description: mem.description || '',
      date: mem.date ? new Date(mem.date).toISOString().split('T')[0] : '',
      isTimeCapsule: mem.isTimeCapsule || false,
      unlockDate: mem.unlockDate ? new Date(mem.unlockDate).toISOString().split('T')[0] : '',
      imageUrl: mem.imageUrl || ''
    });
  };

  const cancelarEdicaoMemoria = () => {
    setEditingMemId(null);
    setEditMem({ title: '', description: '', date: '', isTimeCapsule: false, unlockDate: '', imageUrl: '' });
  };

  const guardarEdicaoMemoria = async (id) => {
    if (!editMem.title.trim() || !editMem.date) return;
    if (editMem.isTimeCapsule && !editMem.unlockDate) {
      setErro(t.memories_unlock_error);
      return;
    }
    try {
      setErro('');
      const atualizada = await memoryService.updateMemory(id, editMem);
      const novasMems = memories.map(m => m._id === id ? atualizada : m).sort((a, b) => new Date(a.date) - new Date(b.date));
      setMemories(novasMems);
      const ordenadas = [...novasMems].sort((a, b) => new Date(a.date) - new Date(b.date));
      setPrimeiraData(ordenadas[0].date);
      cancelarEdicaoMemoria();
    } catch (err) {
      setErro(err.message || 'Erro ao editar memória.');
    }
  };

  const formatarDataExtenso = (dataStr) => {
    return formatDateLong(dataStr, language === 'pt' ? 'pt' : 'en');
  };

  return {
    memories,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    erro,
    setErro,
    loading,
    contadorDias,
    primeiraData,
    isTimeCapsule,
    setIsTimeCapsule,
    unlockDate,
    setUnlockDate,
    imageUrl,
    setImageUrl,
    editingMemId,
    editMem,
    setEditMem,
    enviarMemoria,
    apagarMemoria,
    iniciarEdicaoMemoria,
    cancelarEdicaoMemoria,
    guardarEdicaoMemoria,
    formatarDataExtenso
  };
}
