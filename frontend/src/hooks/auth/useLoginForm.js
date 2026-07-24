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
      const dados = await authService.login(username, password, deviceToken);

      // Se necessitar de verificação por email (2FA)
      if (dados.requiresVerification) {
        setRequiresVerification(true);
        setTempUserId(dados.userId);
        if (dados.emailMasked) {
          setEmailMasked(dados.emailMasked);
        }
        return;
      }

      // Verifica se temos de mandar a pessoa para o ecrã de mudar password
      if (dados.precisaMudarPassword) {
        navigate('/forcar-password', { state: { userId: dados.userId } });
        return; 
      }

      // Se estiver tudo normal:
      localStorage.setItem('token', 'session_active');
      localStorage.setItem('nome', dados.username);
      localStorage.setItem('role', dados.role); 
      localStorage.setItem('coupleId', dados.coupleId || '');
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
      const dados = await authService.verifyLogin(tempUserId, verificationCode, trustDevice);

      localStorage.setItem('token', 'session_active');
      localStorage.setItem('nome', dados.username);
      localStorage.setItem('role', dados.role);
      localStorage.setItem('coupleId', dados.coupleId || '');
      window.dispatchEvent(new Event('authChange'));

      if (dados.trustedDeviceToken) {
        localStorage.setItem('trustedDeviceToken', dados.trustedDeviceToken);
      }

      navigate('/dashboard');
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
      if (res.emailMasked) {
        setEmailMasked(res.emailMasked);
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
