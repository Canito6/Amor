import { useState } from 'react';
import { authService } from '../../services/auth/authService';

export default function useLoginForm(navigate) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  
  // 2FA Verification States
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [tempUserId, setTempUserId] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [isResending, setIsResending] = useState(false);

  const fazerLogin = async (e) => {
    e.preventDefault(); 
    setErro(''); 
    setInfoMessage('');

    try {
      const deviceToken = localStorage.getItem('trustedDeviceToken');
      const res = await authService.login(username, password, deviceToken);

      // Se necessitar de verificação por email (2FA)
      if (res.requiresVerification || res.data?.requiresVerification) {
        setRequiresVerification(true);
        setTempUserId(res.userId || res.data?.userId);
        if (res.emailMasked || res.data?.emailMasked) {
          setEmailMasked(res.emailMasked || res.data?.emailMasked);
        }
        return;
      }

      // Verifica se temos de mandar a pessoa para o ecrã de mudar password
      if (res.precisaMudarPassword || res.data?.precisaMudarPassword) {
        navigate('/forcar-password', { state: { userId: res.userId || res.data?.userId } });
        return; 
      }

      // Extrair token e dados de utilizador da resposta (suportando { token, ... } ou { data: { token, user } })
      const token = res.token || res.data?.token || 'session_active';
      const user = res.user || res.data?.user;
      const nome = res.username || user?.username || username;
      const role = res.role || user?.role || 'user';
      const coupleId = res.coupleId || user?.coupleId || '';

      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      localStorage.setItem('nome', nome);
      localStorage.setItem('role', role);
      localStorage.setItem('coupleId', coupleId);

      window.dispatchEvent(new Event('authChange'));
      navigate('/dashboard');
    } catch (error) {
      setErro(error.message || 'Erro ao fazer login.');
    }
  };

  const confirmarCodigo = async (e) => {
    e.preventDefault();
    setErro('');
    setInfoMessage('');

    try {
      const res = await authService.verifyLogin(tempUserId, verificationCode, trustDevice);

      // Extrair token e dados de utilizador da resposta do 2FA
      const token = res.token || res.data?.token || 'session_active';
      const user = res.user || res.data?.user;
      const nome = res.username || user?.username;
      const role = res.role || user?.role;
      const coupleId = res.coupleId || user?.coupleId || '';
      const trustedDeviceToken = res.trustedDeviceToken || res.data?.trustedDeviceToken;

      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        if (nome) localStorage.setItem('nome', nome);
        if (role) localStorage.setItem('role', role);
        if (coupleId) localStorage.setItem('coupleId', coupleId);
        if (trustedDeviceToken) {
          localStorage.setItem('trustedDeviceToken', trustedDeviceToken);
        }

        window.dispatchEvent(new Event('authChange'));
        navigate('/dashboard');
      } else {
        setErro('Erro ao obter token de autenticação.');
      }
    } catch (error) {
      setErro(error.message || 'Erro ao verificar código.');
    }
  };

  const reenviarCodigo = async () => {
    if (isResending || !tempUserId) return;
    setErro('');
    setInfoMessage('');
    setIsResending(true);
    try {
      const res = await authService.resendCode(tempUserId);
      setInfoMessage(res.message || 'Novo código de verificação enviado por e-mail! ✉️');
      if (res.emailMasked || res.data?.emailMasked) {
        setEmailMasked(res.emailMasked || res.data?.emailMasked);
      }
    } catch (error) {
      setErro(error.message || 'Erro ao reenviar código.');
    } finally {
      setIsResending(false);
    }
  };

  const voltarParaPassword = () => {
    setRequiresVerification(false);
    setVerificationCode('');
    setEmailMasked('');
    setErro('');
    setInfoMessage('');
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    erro,
    setErro,
    infoMessage,
    setInfoMessage,
    requiresVerification,
    verificationCode,
    setVerificationCode,
    trustDevice,
    setTrustDevice,
    emailMasked,
    isResending,
    fazerLogin,
    confirmarCodigo,
    reenviarCodigo,
    voltarParaPassword
  };
}
