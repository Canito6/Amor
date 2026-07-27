import { useState, useEffect, useMemo } from 'react';
import { authService } from '../../services/auth/authService';

export default function useRegisterForm(navigate) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginSecurityMethod, setLoginSecurityMethod] = useState('direct');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Rastreio dos campos focados/editados pelo utilizador
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteCode(invite);
    }
  }, []);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Regras de validação em tempo real
  const errors = useMemo(() => {
    const errs = {};

    if (touched.username || username.length > 0) {
      if (!username || username.trim().length < 3) {
        errs.username = 'O utilizador deve ter pelo menos 3 caracteres.';
      }
    }

    if (touched.email || email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        errs.email = 'Insere um endereço de email válido.';
      }
    }

    if (touched.password || password.length > 0) {
      const hasLetterAndNumber = /^(?=.*[A-Za-z])(?=.*\d)/;
      if (!password || password.length < 8) {
        errs.password = 'A password deve ter pelo menos 8 caracteres.';
      } else if (!hasLetterAndNumber.test(password)) {
        errs.password = 'A password deve conter pelo menos 1 letra e 1 número.';
      }
    }

    if (touched.confirmPassword || confirmPassword.length > 0) {
      if (!confirmPassword) {
        errs.confirmPassword = 'Por favor confirma a tua password.';
      } else if (confirmPassword !== password) {
        errs.confirmPassword = 'As passwords não coincidem.';
      }
    }

    return errs;
  }, [username, email, password, confirmPassword, touched]);

  // Indicadores de validade individual
  const isUsernameValid = username.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
  const isConfirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;

  const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  const criarConta = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Marcar todos como touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (!isFormValid) {
      setErro('Por favor preenche todos os campos corretamente antes de submeter.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.register(
        username.trim(), 
        email.trim(), 
        password, 
        loginSecurityMethod, 
        inviteCode
      );
      
      setSucesso('Conta criada com sucesso! A redirecionar para o Login... 🚀');
      setTimeout(() => navigate('/'), 1800); 
    } catch (error) {
      setErro(error.message || 'Erro ao criar conta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loginSecurityMethod,
    setLoginSecurityMethod,
    inviteCode,
    setInviteCode,
    isSubmitting,
    erro,
    sucesso,
    errors,
    touched,
    handleBlur,
    isUsernameValid,
    isEmailValid,
    isPasswordValid,
    isConfirmPasswordValid,
    isFormValid,
    criarConta
  };
}
