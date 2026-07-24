import { useState, useEffect } from 'react';
import { authService } from '../../services/auth/authService';

export default function useRegisterForm(navigate) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginSecurityMethod, setLoginSecurityMethod] = useState('direct');
  const [inviteCode, setInviteCode] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteCode(invite);
    }
  }, []);

  const criarConta = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      await authService.register(
        username, 
        email, 
        password, 
        loginSecurityMethod, 
        inviteCode
      );
      
      setSucesso('Conta criada com sucesso! A redirecionar para o Login... 🚀');
      setTimeout(() => navigate('/'), 2000); 
    } catch (error) {
      setErro(error.message || 'Erro ao criar conta.');
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    loginSecurityMethod,
    setLoginSecurityMethod,
    inviteCode,
    setInviteCode,
    erro,
    sucesso,
    criarConta
  };
}
