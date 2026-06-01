import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memoryService } from '../services/memoryService';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import DaysCounter from '../components/memories/DaysCounter';
import MemoryForm from '../components/memories/MemoryForm';
import MemoryTimeline from '../components/memories/MemoryTimeline';
import './Memorias.css';

export default function Memorias() {
  const [memories, setMemories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [contadorDias, setContadorDias] = useState(0);
  const [primeiraData, setPrimeiraData] = useState(null);
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');

  // Estados para edição inline de memórias
  const [editingMemId, setEditingMemId] = useState(null);
  const [editMem, setEditMem] = useState({ title: '', description: '', date: '', isTimeCapsule: false, unlockDate: '' });

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  const { language } = usePreferences();
  const t = translations[language];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    carregarMemoras();
  }, [navigate]);

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

  const carregarMemoras = async () => {
    try {
      setLoading(true);
      const dados = await memoryService.getMemories();
      setMemories(dados);

      // Encontrar a memória mais antiga para servir de data de aniversário/início
      if (dados.length > 0) {
        // Ordenamos cópia para não alterar a ordem do ecrã
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

  const enviarMemoria = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    if (isTimeCapsule && !unlockDate) {
      setErro(t.memories_unlock_error);
      return;
    }

    try {
      setErro('');
      const novaMem = await memoryService.createMemory({ title, description, date, isTimeCapsule, unlockDate });

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
      alert(isTimeCapsule ? t.memories_success_lock : t.memories_success_normal);
    } catch (err) {
      setErro(t.memories_error_save || err.message);
    }
  };

  const apagarMemoria = async (id) => {
    if (!window.confirm(t.memories_delete_confirm)) return;

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
      unlockDate: mem.unlockDate ? new Date(mem.unlockDate).toISOString().split('T')[0] : ''
    });
  };

  const cancelarEdicaoMemoria = () => {
    setEditingMemId(null);
    setEditMem({ title: '', description: '', date: '', isTimeCapsule: false, unlockDate: '' });
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

  // Helper para formatar datas em texto por extenso
  const formatarDataExtenso = (dataStr) => {
    const dataObj = new Date(dataStr);
    return dataObj.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="app-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>{t.memories_title}</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      {/* Caixa do Contador de Dias Juntos */}
      <DaysCounter
        t={t}
        primeiraData={primeiraData}
        contadorDias={contadorDias}
        formatarDataExtenso={formatarDataExtenso}
      />

      {/* Formulário para Adicionar Memória */}
      <MemoryForm
        t={t}
        enviarMemoria={enviarMemoria}
        title={title}
        setTitle={setTitle}
        language={language}
        date={date}
        setDate={setDate}
        description={description}
        setDescription={setDescription}
        isTimeCapsule={isTimeCapsule}
        setIsTimeCapsule={setIsTimeCapsule}
        unlockDate={unlockDate}
        setUnlockDate={setUnlockDate}
        erro={erro}
      />

      {/* Linha do Tempo */}
      <MemoryTimeline
        t={t}
        loading={loading}
        memories={memories}
        meuNome={meuNome}
        minhaRole={minhaRole}
        editingMemId={editingMemId}
        editMem={editMem}
        setEditMem={setEditMem}
        guardarEdicaoMemoria={guardarEdicaoMemoria}
        cancelarEdicaoMemoria={cancelarEdicaoMemoria}
        formatarDataExtenso={formatarDataExtenso}
        iniciarEdicaoMemoria={iniciarEdicaoMemoria}
        apagarMemoria={apagarMemoria}
      />
    </div>
  );
}
