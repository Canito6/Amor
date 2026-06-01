import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

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
      setErro(err.message || 'Erro ao carregar memórias.');
    } finally {
      setLoading(false);
    }
  };

  const enviarMemoria = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    if (isTimeCapsule && !unlockDate) {
      setErro('Define a data de abertura da Cápsula do Tempo.');
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
      alert(isTimeCapsule ? 'Cápsula do Tempo criada com sucesso! 🔒⏳' : 'Momento marcante guardado na Timeline! ⏳💖');
    } catch (err) {
      setErro(err.message || 'Erro ao guardar momento.');
    }
  };

  const apagarMemoria = async (id) => {
    if (!window.confirm('Queres apagar este momento especial da vossa Linha do Tempo?')) return;

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
      setErro(err.message || 'Erro ao apagar momento.');
    }
  };

  // Helper para formatar datas em texto por extenso em português
  const formatarDataExtenso = (dataStr) => {
    const dataObj = new Date(dataStr);
    return dataObj.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="app-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ Voltar ao Dashboard
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>As Nossas Memórias ⏳</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      {/* Caixa do Contador de Dias Juntos */}
      {primeiraData && (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginBottom: '40px', border: '2px solid var(--primary-color)' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--primary-color)', marginBottom: '8px' }}>
            Contador do Amor ❤️
          </h2>
          <p style={{ fontSize: '18px', margin: '10px 0' }}>
            Já se passaram <strong style={{ fontSize: '32px', color: 'var(--secondary-color)' }}>{contadorDias}</strong> dias desde o vosso primeiro marco!
          </p>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            (Calculado a partir de: {formatarDataExtenso(primeiraData)})
          </span>
        </div>
      )}

      {/* Formulário para Adicionar Memória */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Adicionar Momento Especial à Timeline 📅</h2>
        <form onSubmit={enviarMemoria} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label className="input-label">Título do Acontecimento</label>
              <input
                type="text"
                placeholder="Ex: O nosso primeiro encontro..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input-control"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Data do Momento</label>
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
            <label className="input-label">Descrição (Opcional)</label>
            <textarea
              placeholder="Descreve o que aconteceu, o que sentiram ou uma memória engraçada deste dia..."
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
              🔒 Criar como Cápsula do Tempo (Trancar até uma data futura)
            </label>
            
            {isTimeCapsule && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="input-label">Data de Abertura (Quando ficará visível?)</label>
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
              {isTimeCapsule ? 'Trancar Cápsula do Tempo 🔒' : 'Registar Acontecimento 💕'}
            </button>
          </div>
        </form>
        {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
      </div>

      {/* Linha do Tempo */}
      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>A carregar a vossa linha do tempo... ⏳</p>
        </div>
      ) : memories.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Ainda não registaram nenhuma memória especial. Comecem a escrever a vossa história! 📖</p>
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
                    {mem.isTimeCapsule && (mem.locked ? ' 🔒 (Trancado)' : ' 🔓 (Cápsula Aberta)')}
                  </span>
                  <h3 className="timeline-title" style={mem.locked ? { color: 'var(--secondary-color)' } : {}}>{mem.title}</h3>
                  {mem.locked ? (
                    <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '12px', marginTop: '10px', fontSize: '13px', border: '1px solid rgba(114, 9, 183, 0.15)' }}>
                      ⏳ Esta Cápsula do Tempo só abre a <strong>{formatarDataExtenso(mem.unlockDate)}</strong>. O segredo está guardado até lá! ❤️
                    </div>
                  ) : (
                    mem.description && <p className="timeline-desc">{mem.description}</p>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Registo por: <strong>{mem.createdBy}</strong></span>
                    {podeApagar && (
                      <button 
                        onClick={() => apagarMemoria(mem._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                        title="Apagar momento"
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
