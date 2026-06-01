import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';

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
      const dados = await apiFetch('/api/memories');
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
      const novaMem = await apiFetch('/api/memories', {
        method: 'POST',
        body: { title, description, date, isTimeCapsule, unlockDate }
      });

      // Insere na lista ordenada por data
      const novasMems = [...memories, novaMem].sort((a, b) => new Date(a.date) - new Date(b.date));
      setMemories(novasMems);
      
      // Atualiza primeira data se for a mais antiga
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
      await apiFetch(`/api/memories/${id}`, {
        method: 'DELETE'
      });
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
      {primeiraData && (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginBottom: '40px', border: '2px solid var(--primary-color)' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--primary-color)', marginBottom: '8px' }}>
            {t.memories_counter_title}
          </h2>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            {t.memories_counter_body.split('{count}')[0]}
            <strong style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>{contadorDias}</strong>
            {t.memories_counter_body.split('{count}')[1]}
          </p>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {t.memories_counter_footer.replace('{date}', formatarDataExtenso(primeiraData))}
          </span>
        </div>
      )}

      {/* Formulário para Adicionar Memória */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>{t.memories_add_title}</h2>
        <form onSubmit={enviarMemoria} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label className="input-label">{t.memories_input_title}</label>
              <input
                type="text"
                placeholder={language === 'pt' ? 'Ex: O nosso primeiro encontro...' : 'E.g., Our first date...'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input-control"
              />
            </div>
            <div className="form-group">
              <label className="input-label">{t.memories_input_date}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="input-control"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">{t.memories_input_desc}</label>
            <textarea
              placeholder={t.memories_desc_placeholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="input-control"
              style={{ resize: 'vertical' }}
              disabled={isTimeCapsule} // Cápsulas trancadas não devem revelar detalhes antes de tempo
            />
          </div>

          {/* Opções de Cápsula do Tempo */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', marginBottom: '15px', border: '1px solid rgba(114, 9, 183, 0.15)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={isTimeCapsule}
                onChange={(e) => setIsTimeCapsule(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              {t.memories_time_capsule_check}
            </label>
            
            {isTimeCapsule && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="input-label">{t.memories_input_unlock_date}</label>
                <input
                  type="date"
                  value={unlockDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  required
                  className="input-control"
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
            <button type="submit" className="btn btn-primary">
              {isTimeCapsule ? t.memories_submit_lock : t.memories_submit_normal}
            </button>
          </div>
        </form>
        {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
      </div>

      {/* Linha do Tempo */}
      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{t.memories_loading}</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{t.memories_empty}</p>
        </div>
      ) : (
        <div className="timeline">
          {memories.map((mem, index) => {
            const isLeft = index % 2 === 0;
            const podeApagar = mem.createdBy === meuNome || minhaRole === 'admin';
            
            return (
              <div 
                key={mem._id} 
                className={`timeline-item ${isLeft ? 'timeline-left' : 'timeline-right'}`}
              >
                <div className="timeline-card" style={mem.locked ? { border: '1px dashed var(--secondary-color)', background: 'rgba(114, 9, 183, 0.05)' } : {}}>
                  <span className="timeline-date">
                    {formatarDataExtenso(mem.date)}
                    {mem.isTimeCapsule && (mem.locked ? t.memories_timeline_locked : t.memories_timeline_unlocked)}
                  </span>
                  <h3 className="timeline-title" style={mem.locked ? { color: 'var(--secondary-color)' } : {}}>{mem.title}</h3>
                  {mem.locked ? (
                    <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '12px', marginTop: '10px', fontSize: '13px', border: '1px solid rgba(114, 9, 183, 0.15)' }}>
                      {t.memories_timeline_unlock_desc.split('{date}')[0]}
                      <strong>{formatarDataExtenso(mem.unlockDate)}</strong>
                      {t.memories_timeline_unlock_desc.split('{date}')[1]}
                    </div>
                  ) : (
                    mem.description && <p className="timeline-desc">{mem.description}</p>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{t.memories_created_by} <strong>{mem.createdBy}</strong></span>
                    {podeApagar && (
                      <button 
                        onClick={() => apagarMemoria(mem._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
