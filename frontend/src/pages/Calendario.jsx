import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('outro');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    carregarEventos();
  }, [navigate]);

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const dados = await apiFetch('/api/events');
      setEvents(dados);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar calendário.');
    } finally {
      setLoading(false);
    }
  };

  const enviarEvento = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    try {
      setErro('');
      const novoEvt = await apiFetch('/api/events', {
        method: 'POST',
        body: { title, description, date, category }
      });

      // Atualiza a lista e ordena por data cronologicamente
      const novosEvts = [...events, novoEvt].sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(novosEvts);

      setTitle('');
      setDescription('');
      setDate('');
      setCategory('outro');
      alert('Data importante adicionada com sucesso! 📅💖');
    } catch (err) {
      setErro(err.message || 'Erro ao guardar evento.');
    }
  };

  const apagarEvento = async (id) => {
    if (!window.confirm('Queres apagar esta data do calendário?')) return;

    try {
      setErro('');
      await apiFetch(`/api/events/${id}`, {
        method: 'DELETE'
      });
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      setErro(err.message || 'Erro ao apagar evento.');
    }
  };

  // Helper para formatar a data por extenso
  const formatarDataExtenso = (dataStr) => {
    const dataObj = new Date(dataStr);
    return dataObj.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper para calcular dias restantes até à data
  const obterDiasRestantes = (dataStr) => {
    const dataEvento = new Date(dataStr);
    // Zera horas para a comparação ser exata por dias
    dataEvento.setHours(0,0,0,0);
    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    const diferencaMs = dataEvento.getTime() - hoje.getTime();
    const dias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
    return dias;
  };

  // Ícone por categoria
  const obterIconeCategoria = (cat) => {
    switch (cat) {
      case 'aniversario': return '🎂';
      case 'viagem': return '✈️';
      case 'jantar': return '🍽️';
      default: return '🌟';
    }
  };

  // Cor por categoria
  const obterCorCategoria = (cat) => {
    switch (cat) {
      case 'aniversario': return 'var(--primary-color)';
      case 'viagem': return 'var(--secondary-color)';
      case 'jantar': return '#2a9d8f';
      default: return '#f4a261';
    }
  };

  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  const eventosFuturos = events.filter(e => new Date(e.date).setHours(0,0,0,0) >= hoje.getTime());
  const eventosPassados = events.filter(e => new Date(e.date).setHours(0,0,0,0) < hoje.getTime());

  return (
    <div className="app-container fade-in">
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ Voltar ao Dashboard
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>Calendário Partilhado 📅</h1>
        <div style={{ width: '150px' }}></div>
      </div>

      {/* Formulário para Adicionar Evento */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Adicionar Data Importante / Evento 📅</h2>
        <form onSubmit={enviarEvento} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="form-group">
              <label className="input-label">Título do Evento</label>
              <input
                type="text"
                placeholder="Ex: O nosso aniversário de namoro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input-control"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="input-control"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-control"
                style={{ appearance: 'auto' }}
              >
                <option value="aniversario">🎂 Aniversário / Data Especial</option>
                <option value="viagem">✈️ Viagem Planeada</option>
                <option value="jantar">🍽️ Jantar Especial</option>
                <option value="outro">🌟 Outro</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label">Descrição / Detalhes (Opcional)</label>
            <textarea
              placeholder="Ex: Reservar mesa no restaurante X, levar presente, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              className="input-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
            <button type="submit" className="btn btn-primary">
              Adicionar ao Calendário 💖
            </button>
          </div>
        </form>
        {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>A carregar datas importantes... ⏳</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* EVENTOS FUTUROS */}
          <div className="glass-panel" style={{ padding: '25px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--primary-color)', marginBottom: '20px', borderBottom: '2px solid rgba(255, 77, 109, 0.1)', paddingBottom: '8px' }}>
              🚀 Próximos Acontecimentos / Datas Planeadas ({eventosFuturos.length})
            </h2>

            {eventosFuturos.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                Não há eventos planeados para o futuro. Que tal planearem um jantar ou uma viagem? ✈️🍽️
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {eventosFuturos.map((evt) => {
                  const diasRestantes = obterDiasRestantes(evt.date);
                  const podeApagar = evt.createdBy === meuNome || minhaRole === 'admin';
                  const corCat = obterCorCategoria(evt.category);
                  const icone = obterIconeCategoria(evt.category);

                  return (
                    <div 
                      key={evt._id} 
                      style={{ 
                        padding: '20px', 
                        background: 'white', 
                        borderRadius: '18px', 
                        borderLeft: `6px solid ${corCat}`,
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        boxShadow: 'var(--shadow-sm)',
                        flexWrap: 'wrap',
                        gap: '15px'
                      }}
                    >
                      <div style={{ flex: '1', minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '20px' }}>{icone}</span>
                          <h3 style={{ fontSize: '17px', margin: 0 }}>{evt.title}</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                          📅 {formatarDataExtenso(evt.date)} | Criado por: <strong>{evt.createdBy}</strong>
                        </p>
                        {evt.description && (
                          <p style={{ fontSize: '14px', color: 'var(--text-main)', background: '#fcfcfc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0f0f0', margin: 0 }}>
                            {evt.description}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span 
                          style={{ 
                            fontSize: '14px', 
                            color: 'white', 
                            background: corCat, 
                            padding: '8px 16px', 
                            borderRadius: '12px',
                            fontWeight: '700',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                          }}
                        >
                          {diasRestantes === 0 ? '🎯 É HOJE!' : (diasRestantes === 1 ? '⏳ Faltam 1 dia' : `⏳ Faltam ${diasRestantes} dias`)}
                        </span>
                        
                        {podeApagar && (
                          <button
                            onClick={() => apagarEvento(evt._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--danger-color)',
                              cursor: 'pointer',
                              fontSize: '16px',
                              padding: '5px'
                            }}
                            title="Apagar evento"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* HISTÓRICO DE EVENTOS PASSADOS */}
          <div className="glass-panel" style={{ padding: '25px' }}>
            <h2 style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '20px', borderBottom: '2px solid rgba(0, 0, 0, 0.05)', paddingBottom: '8px' }}>
              📜 Datas que já Guardámos / Passadas ({eventosPassados.length})
            </h2>

            {eventosPassados.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                Ainda não há histórico de eventos passados registados no calendário.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {eventosPassados.map((evt) => {
                  const podeApagar = evt.createdBy === meuNome || minhaRole === 'admin';
                  const corCat = obterCorCategoria(evt.category);
                  const icone = obterIconeCategoria(evt.category);

                  return (
                    <div 
                      key={evt._id} 
                      style={{ 
                        padding: '15px 20px', 
                        background: '#fafafa', 
                        borderRadius: '16px', 
                        borderLeft: `5px solid #ccc`,
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        opacity: '0.85'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px' }}>{icone}</span>
                          <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--text-muted)' }}>{evt.title}</h3>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          📅 {formatarDataExtenso(evt.date)} | Por: {evt.createdBy}
                        </span>
                      </div>
                      
                      {podeApagar && (
                        <button
                          onClick={() => apagarEvento(evt._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--danger-color)',
                            cursor: 'pointer',
                            fontSize: '15px',
                            padding: '4px'
                          }}
                          title="Apagar evento"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
