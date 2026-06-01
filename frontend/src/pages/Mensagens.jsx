import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export default function Mensagens() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const meuNome = localStorage.getItem('nome');
  const minhaRole = localStorage.getItem('role');

  // Cores pastel para rodar nas notas
  const coresPostIt = [
    { bg: '#fff9db', border: '#ffe066' }, // Amarelo
    { bg: '#e3faf2', border: '#96f2d7' }, // Verde
    { bg: '#e8f0fe', border: '#adc6ff' }, // Azul
    { bg: '#fff0f6', border: '#ffdeeb' }, // Rosa
    { bg: '#f3f0ff', border: '#d0bfff' }  // Roxo
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    carregarMensagens();
  }, [navigate]);

  const carregarMensagens = async () => {
    try {
      setLoading(true);
      const dados = await apiFetch('/api/messages');
      setMessages(dados);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar mensagens.');
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setErro('');
      const novaMsg = await apiFetch('/api/messages', {
        method: 'POST',
        body: { content }
      });
      // Adiciona ao final da lista (ou recarrega)
      setMessages([...messages, novaMsg]);
      setContent('');
    } catch (err) {
      setErro(err.message || 'Erro ao enviar nota.');
    }
  };

  const apagarMensagem = async (id) => {
    if (!window.confirm('Tens a certeza que queres apagar esta nota especial?')) return;

    try {
      setErro('');
      await apiFetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });
      setMessages(messages.filter((msg) => msg._id !== id));
    } catch (err) {
      setErro(err.message || 'Erro ao apagar nota.');
    }
  };

  return (
    <div className="app-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button className="btn btn-dark" onClick={() => navigate('/dashboard')}>
          ⬅ Voltar ao Dashboard
        </button>
        <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '28px' }}>Mural de Notas 💌</h1>
        <div style={{ width: '150px' }}></div> {/* Spacer */}
      </div>

      <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '15px', fontSize: '20px' }}>Escreve algo bonito... ✨</h2>
        <form onSubmit={enviarMensagem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <textarea
            className="input-control"
            placeholder="Deixa aqui uma carta de amor, um recado fofo ou uma nota de carinho..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="4"
            required
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              Enviar para o Mural 💖
            </button>
          </div>
        </form>
        {erro && <p style={{ color: 'var(--danger-color)', marginTop: '15px', fontWeight: 'bold' }}>{erro}</p>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>A carregar as vossas notas... ⏳</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>O vosso mural está vazio! Que tal seres o primeiro a escrever um carinho? ✏️</p>
        </div>
      ) : (
        <div className="notes-grid">
          {messages.map((msg, index) => {
            const cores = coresPostIt[index % coresPostIt.length];
            const podeApagar = msg.sender === meuNome || minhaRole === 'admin';
            
            return (
              <div 
                key={msg._id} 
                className="post-it"
                style={{ 
                  backgroundColor: cores.bg, 
                  borderColor: cores.border 
                }}
              >
                <div className="post-it-content">
                  {msg.content}
                </div>
                <div className="post-it-footer">
                  <div>
                    Por <span className="post-it-author">{msg.sender}</span>
                    <br />
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>
                      {new Date(msg.createdAt).toLocaleDateString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {podeApagar && (
                    <button 
                      onClick={() => apagarMensagem(msg._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger-color)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px'
                      }}
                      title="Apagar Nota"
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
  );
}
