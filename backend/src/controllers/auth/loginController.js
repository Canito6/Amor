const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const eventBus = require('../../utils/eventBus');
const User = require('../../models/auth/userModel');
const ApiError = require('../../utils/apiError');
const { setTokenCookie } = require('./authHelper');
const TokenBlacklist = require('../../models/auth/tokenBlacklistModel');

exports.login = async (req, res, next) => {
  try {
    const { username, password, trustedDeviceToken } = req.body;
    
    // Procura quem está a tentar entrar
    const user = await User.findOne({ username });
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
      return res.json({ 
        precisaMudarPassword: true, 
        userId: user._id, 
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
      await user.save();

      // Send code
      if (user.loginSecurityMethod === 'email') {
        eventBus.emit('mail:send', {
          to: user.email,
          subject: '🔑 Código de Acesso - O Nosso Cantinho',
          text: `Olá ${user.username},\n\nO teu código de acesso para entrar é: ${code}\n\nEste código é válido por 5 minutos.`
        });
      } else if (user.loginSecurityMethod === 'mobile') {
        console.log(`\n==================================================`);
        console.log(`[SMS MOCK] Enviando SMS para ${user.phoneNumber || 'número não registado'}:`);
        console.log(`Código de Acesso: ${code}`);
        console.log(`==================================================\n`);
      }

      return res.json({
        requiresVerification: true,
        method: user.loginSecurityMethod,
        userId: user._id,
        // Expose code in development for easy testing if method is mobile
        mockCode: process.env.NODE_ENV !== 'production' && user.loginSecurityMethod === 'mobile' ? code : undefined
      });
    }

    // Cria o "bilhete" de acesso (Token) válido por 7 dias, incluindo também o cargo (role) no bilhete!
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId || 'default_couple' }, 
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
      coupleId: user.coupleId || 'default_couple'
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

    if (!user.loginVerificationCode || user.loginVerificationCode !== code || !user.loginVerificationExpires || user.loginVerificationExpires < Date.now()) {
      throw new ApiError(400, 'Código de verificação incorreto ou expirado.');
    }

    // Clear verification code
    user.loginVerificationCode = undefined;
    user.loginVerificationExpires = undefined;

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
      { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId || 'default_couple' }, 
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
      coupleId: user.coupleId || 'default_couple',
      trustedDeviceToken
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
