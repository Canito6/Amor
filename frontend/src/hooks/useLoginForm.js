import { useState } from 'react';
import { authService } from '../services/auth/authService';

export default function useLoginForm(navigate) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  
  // 2FA Verification States
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [tempUserId, setTempUserId] = useState('');
  const [securityMethod, setSecurityMethod] = useState('');
  const [mockSMSCode, setMockSMSCode] = useState('');

  const fazerLogin = async (e) => {
    e.preventDefault(); 
    setErro(''); 

    try {
      const deviceToken = localStorage.getItem('trustedDeviceToken');
      const dados = await authService.login(username, password, deviceToken);

      // Se necessitar de verificação por email ou telemóvel (2FA)
      if (dados.requiresVerification) {
        setRequiresVerification(true);
        setTempUserId(dados.userId);
        setSecurityMethod(dados.method);
        setMockSMSCode(dados.mockCode || '');
        return;
      }

      // Verifica se temos de mandar a pessoa para o ecrã de mudar password
      if (dados.precisaMudarPassword) {
        navigate('/forcar-password', { state: { userId: dados.userId } });
        return; 
      }

      // Se estiver tudo normal:
      localStorage.setItem('token', dados.token);
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

    try {
      const dados = await authService.verifyLogin(tempUserId, verificationCode, trustDevice);

      localStorage.setItem('token', dados.token);
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

  const voltarParaPassword = () => {
    setRequiresVerification(false);
    setVerificationCode('');
    setMockSMSCode('');
    setErro('');
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    erro,
    setErro,
    requiresVerification,
    verificationCode,
    setVerificationCode,
    trustDevice,
    setTrustDevice,
    securityMethod,
    mockSMSCode,
    fazerLogin,
    confirmarCodigo,
    voltarParaPassword
  };
}
