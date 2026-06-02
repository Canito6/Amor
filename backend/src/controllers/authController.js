const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { transporter } = require('../utils/mailer');
const User = require('../models/User');
const Couple = require('../models/Couple');
const ApiError = require('../utils/apiError');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, codigoAdmin, loginSecurityMethod, phoneNumber, inviteCode } = req.body;
    
    // Verifica se o nome ou o email já estão a ser usados
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      throw new ApiError(400, 'Este utilizador ou email já existe!');
    }

    // A MAGIA DO ADMIN: Se o código secreto inserido for o do .env, o cargo passa a ser 'admin'
    const adminSecret = process.env.ADMIN_SECRET_CODE || 'ChefeCanito';
    const role = codigoAdmin === adminSecret ? 'admin' : 'user';

    const user = new User({ 
      username, 
      email, 
      password, 
      role,
      loginSecurityMethod: loginSecurityMethod || 'direct',
      phoneNumber: phoneNumber || ''
    });

    if (inviteCode && inviteCode.trim() !== '') {
      // Find the couple by inviteCode (which is the coupleId)
      const couple = await Couple.findById(inviteCode);
      if (couple) {
        user.coupleId = inviteCode;
        couple.partner2 = user._id;
        await couple.save();
      } else {
        // Fallback: create a new couple if the invite code is not found in DB
        const newCouple = new Couple({ partner1: user._id });
        await newCouple.save();
        user.coupleId = newCouple._id;
      }
    } else {
      // Create a brand new couple
      const newCouple = new Couple({ partner1: user._id });
      await newCouple.save();
      user.coupleId = newCouple._id;
    }

    await user.save();

    res.status(201).json({ message: 'Conta criada com sucesso!' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password, trustedDeviceToken } = req.body;
    
    // Procura quem está a tentar entrar
    const user = await User.findOne({ username });
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado!');
    }

    // Compara a password escrita com a encriptada na base de dados
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(400, 'Password incorreta!');
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
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.loginVerificationCode = code;
      user.loginVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
      await user.save();

      // Send code
      if (user.loginSecurityMethod === 'email') {
        const mailOptions = {
          from: `"O Nosso Cantinho ❤️" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: '🔑 Código de Acesso - O Nosso Cantinho',
          text: `Olá ${user.username},\n\nO teu código de acesso para entrar é: ${code}\n\nEste código é válido por 5 minutos.`
        };
        await transporter.sendMail(mailOptions);
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
        mockCode: user.loginSecurityMethod === 'mobile' ? code : undefined
      });
    }

    // Cria o "bilhete" de acesso (Token) válido por 7 dias, incluindo também o cargo (role) no bilhete!
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId || 'default_couple' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

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

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'Não encontrámos nenhuma conta com este email.');
    }

    const codigoRecuperacao = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = codigoRecuperacao;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora de validade
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '❤️ Código de Recuperação - O Nosso Cantinho',
      text: `Olá ${user.username},\n\nO teu código para recuperar a password é: ${codigoRecuperacao}\n\nEste código é válido por 1 hora. Insere-o na página do site para criares uma password nova.\n\nSe não pediste isto, podes ignorar este email.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email enviado com sucesso!' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, codigo, novaPassword } = req.body;

    const user = await User.findOne({
      email: email,
      resetPasswordToken: codigo,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'O código é inválido ou já expirou!');
    }

    user.password = novaPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password alterada com sucesso! Já podes fazer login.' });
  } catch (error) {
    next(error);
  }
};

exports.forcarMudancaPassword = async (req, res, next) => {
  try {
    const { userId, novaPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado.');
    }

    user.password = novaPassword;
    user.precisaMudarPassword = false; // Já não precisa de mudar
    await user.save();

    // Faz logo o login automático e devolve o token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId || 'default_couple' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Password definida com sucesso!', 
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


