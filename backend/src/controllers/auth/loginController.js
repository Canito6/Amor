const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const eventBus = require('../../utils/eventBus');
const User = require('../../models/auth/userModel');
const ApiError = require('../../utils/apiError');
const { setTokenCookie } = require('./authHelper');
const TokenBlacklist = require('../../models/auth/tokenBlacklistModel');

exports.login = async (req, res, next) => {
  try {
    const rawInput = req.body.username || req.body.email;
    if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
      throw new ApiError(400, 'Nome de utilizador ou e-mail é obrigatório!');
    }

    const { password, trustedDeviceToken } = req.body;
    
    const searchInput = rawInput.trim().toLowerCase();
    const escapedInput = searchInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Procura quem está a tentar entrar por username ou email (case-insensitive)
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${escapedInput}$`, 'i') } },
        { email: { $regex: new RegExp(`^${escapedInput}$`, 'i') } }
      ]
    });

    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado!');
    }

    // Verificar se a conta está temporariamente bloqueada
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      throw new ApiError(423, `Conta temporariamente bloqueada devido a sucessivas tentativas falhadas. Tente novamente em ${remainingMinutes} minutos.`);
    }

    // Compara a password escrita com a encriptada na base de dados
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Bloqueia por 15 minutos
      }
      await user.save();
      throw new ApiError(400, 'Password incorreta!');
    }

    // Repor tentativas em caso de sucesso
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // NOVO: Verifica se o admin forçou a mudança de password
    if (user.precisaMudarPassword) {
      // [SEGURANÇA] Emitir token temporário para permitir apenas que o utilizador legítimo altere a sua password
      const tempToken = jwt.sign(
        { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId, tempChangePassword: true }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' } // Válido apenas por 15 minutos
      );

      // Guardar token temporário num cookie HTTP-Only seguro
      setTokenCookie(res, tempToken);

      return res.json({ 
        precisaMudarPassword: true, 
        userId: user._id, 
        token: tempToken,
        message: 'Precisas de definir uma nova password antes de entrar.' 
      });
    }

    // Check if verification is needed (not direct and device not trusted)
    const needs2FA = user.loginSecurityMethod && user.loginSecurityMethod !== 'direct';
    let isDeviceTrusted = false;

    if (needs2FA && trustedDeviceToken) {
      const found = user.trustedDevices.find(d => d.deviceToken === trustedDeviceToken && d.expiresAt > Date.now());
      if (found) {
        isDeviceTrusted = true;
      }
    }

    if (needs2FA && !isDeviceTrusted) {
      // Generate a 6-digit verification code
      const code = crypto.randomInt(100000, 1000000).toString();
      user.loginVerificationCode = code;
      user.loginVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
      user.loginVerificationAttempts = 0; // [SEGURANÇA - VULN-001] Reset do contador ao gerar novo código
      await user.save();

      // Send code via email
      eventBus.emit('mail:send', {
        to: user.email,
        subject: '🔑 Código de Acesso - O Nosso Cantinho',
        text: `Olá ${user.username},\n\nO teu código de acesso para entrar é: ${code}\n\nEste código é válido por 5 minutos.`
      });

      // Mask email for display in UI (e.g. ma***@gmail.com)
      const emailParts = user.email.split('@');
      const emailMasked = emailParts[0].length > 2 
        ? `${emailParts[0].slice(0, 2)}***@${emailParts[1]}` 
        : `${emailParts[0]}***@${emailParts[1]}`;

      return res.json({
        requiresVerification: true,
        method: 'email',
        userId: user._id,
        emailMasked
      });
    }

    // Cria o "bilhete" de acesso (Token) válido por 7 dias, incluindo também o cargo (role) no bilhete!
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Guardar token num cookie HTTP-Only seguro
    setTokenCookie(res, token);

    res.json({ 
      message: 'Login feito com sucesso!', 
      token, 
      username: user.username,
      role: user.role,
      coupleId: user.coupleId
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyLogin = async (req, res, next) => {
  try {
    const { userId, code, trustDevice } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado.');
    }

    if (!user.loginVerificationCode || !user.loginVerificationExpires || user.loginVerificationExpires < Date.now()) {
      throw new ApiError(400, 'Código de verificação expirado ou inexistente. Por favor, faça login novamente.');
    }

    if (user.loginVerificationCode !== code) {
      user.loginVerificationAttempts += 1;
      if (user.loginVerificationAttempts >= 3) {
        // [SEGURANÇA - VULN-001] Impedir força bruta invalidando o código após 3 tentativas falhadas
        user.loginVerificationCode = undefined;
        user.loginVerificationExpires = undefined;
        user.loginVerificationAttempts = 0;
        await user.save();
        throw new ApiError(400, 'Limite de tentativas excedido para este código. Por favor, inicie sessão novamente para obter um novo.');
      }
      await user.save();
      throw new ApiError(400, 'Código de verificação incorreto.');
    }

    // [SEGURANÇA - VULN-001] Reset das tentativas de 2FA em caso de sucesso
    user.loginVerificationCode = undefined;
    user.loginVerificationExpires = undefined;
    user.loginVerificationAttempts = 0;

    let trustedDeviceToken = undefined;
    if (trustDevice) {
      trustedDeviceToken = crypto.randomBytes(32).toString('hex');
      user.trustedDevices.push({
        deviceToken: trustedDeviceToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Guardar token num cookie HTTP-Only seguro
    setTokenCookie(res, token);

    res.json({
      message: 'Login feito com sucesso!',
      token,
      username: user.username,
      role: user.role,
      coupleId: user.coupleId,
      trustedDeviceToken
    });
  } catch (error) {
    next(error);
  }
};

exports.resendVerificationCode = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      throw new ApiError(400, 'Identificador de utilizador não fornecido.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado.');
    }

    // Gerar novo código de 6 dígitos
    const code = crypto.randomInt(100000, 1000000).toString();
    user.loginVerificationCode = code;
    user.loginVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutos
    user.loginVerificationAttempts = 0;
    await user.save();

    // Enviar por email
    eventBus.emit('mail:send', {
      to: user.email,
      subject: '🔑 Novo Código de Acesso - O Nosso Cantinho',
      text: `Olá ${user.username},\n\nO teu novo código de acesso é: ${code}\n\nEste código é válido por 5 minutos.`
    });

    const emailParts = user.email.split('@');
    const emailMasked = emailParts[0].length > 2 
      ? `${emailParts[0].slice(0, 2)}***@${emailParts[1]}` 
      : `${emailParts[0]}***@${emailParts[1]}`;

    res.json({
      message: 'Novo código enviado por e-mail!',
      emailMasked
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          if (expiresAt > new Date()) {
            await TokenBlacklist.create({ token, expiresAt });
          }
        }
      } catch (err) {
        console.error('Erro ao colocar token na blacklist:', err);
      }
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.json({ message: 'Sessão terminada com sucesso!' });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const oldToken = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!oldToken) {
      throw new ApiError(401, 'Token de sessão não fornecido.');
    }

    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (err) {
      throw new ApiError(401, 'Token inválido.');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado.');
    }

    const newToken = jwt.sign(
      { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    setTokenCookie(res, newToken);

    res.json({
      message: 'Token renovado com sucesso!',
      token: newToken,
      username: user.username,
      role: user.role,
      coupleId: user.coupleId
    });
  } catch (error) {
    next(error);
  }
};
