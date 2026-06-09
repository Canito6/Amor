import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaPassword, setNovaPassword] = useState('');
  const [etapa, setEtapa] = useState(1); // 1 = Pedir Email | 2 = Pedir Código e Nova Password
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  // Função para pedir o código (Etapa 1)
  const pedirCodigo = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('A enviar email... ⏳');

    try {
      const dados = await authService.forgotPassword(email);
      setMensagem(dados.message || 'Código enviado com sucesso!'); 
      setEtapa(2); 
    } catch (error) {
      setMensagem('');
      setErro(error.message || 'Erro ao tentar enviar o email.');
    }
  };

  // Função para guardar a nova password (Etapa 2)
  const redefinirPassword = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('A verificar... ⏳');

    try {
      await authService.resetPassword(email, codigo, novaPassword);
      alert('Password alterada com sucesso! Podes fazer login.');
      navigate('/'); 
    } catch (error) {
      setMensagem('');
      setErro(error.message || 'Erro ao tentar redefinir a password.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
      <div className="glass-panel fade-in" style={{ padding: '40px', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '30px', marginBottom: '10px' }}>Recuperar Password 🔐</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Redefine o teu acesso de forma segura</p>
        
        {etapa === 1 && (
          <form onSubmit={pedirCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '10px' }}>
              Escreve o teu email associado para receberes o código numérico de 6 dígitos.
            </p>
            <div className="form-group">
              <label className="input-label" htmlFor="email">O teu Email</label>
              <input 
                id="email"
                type="email" 
                placeholder="Ex: joao@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-control"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Enviar Código por Email ✉️
            </button>
          </form>
        )}

        {etapa === 2 && (
          <form onSubmit={redefinirPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
              Código de verificação enviado! Verifica o teu email.
            </p>
            
            <div className="form-group">
              <label className="input-label" htmlFor="codigo">Código de 6 dígitos</label>
              <input 
                id="codigo"
                type="text" 
                placeholder="000000" 
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                className="input-control"
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
              />
            </div>
            
            <div className="form-group">
              <label className="input-label" htmlFor="novaPassword">A tua Nova Password</label>
              <input 
                id="novaPassword"
                type="password" 
                placeholder="Escreve a nova password" 
                value={novaPassword}
                onChange={(e) => setNovaPassword(e.target.value)}
                required
                className="input-control"
              />
            </div>
            
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
              Guardar Nova Password 💾
            </button>
          </form>
        )}

        {mensagem && etapa === 1 && (
          <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
            <p style={{ color: 'var(--secondary-color)', fontSize: '14px', margin: 0 }}>{mensagem}</p>
          </div>
        )}
        
        {erro && (
          <div style={{ marginTop: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
            <p style={{ color: 'var(--danger-color)', fontSize: '14px', fontWeight: '600', margin: 0 }}>{erro}</p>
          </div>
        )}
        
        <div style={{ marginTop: '25px', borderTop: '1px dashed rgba(0, 0, 0, 0.1)', paddingTop: '20px' }}>
          <button onClick={() => navigate('/')} className="btn btn-dark" style={{ width: '100%' }}>
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}