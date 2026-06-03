import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export default function useRegisterForm(navigate) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigoAdmin, setCodigoAdmin] = useState('');
  const [loginSecurityMethod, setLoginSecurityMethod] = useState('direct');
  const [phoneNumber, setPhoneNumber] = useState('');
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

    if (loginSecurityMethod === 'mobile' && !phoneNumber.trim()) {
      setErro('O número de telemóvel é obrigatório para a verificação por SMS.');
      return;
    }

    try {
      await authService.register(
        username, 
        email, 
        password, 
        codigoAdmin, 
        loginSecurityMethod, 
        phoneNumber, 
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
    codigoAdmin,
    setCodigoAdmin,
    loginSecurityMethod,
    setLoginSecurityMethod,
    phoneNumber,
    setPhoneNumber,
    inviteCode,
    setInviteCode,
    erro,
    sucesso,
    criarConta
  };
}
