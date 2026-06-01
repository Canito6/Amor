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

exports.getCoupleInfo = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;
    let couple = await Couple.findById(coupleId);
    
    // Find all users belonging to this couple
    const users = await User.find({ coupleId });
    const partnerNames = users.map(u => u.username);

    if (!couple && coupleId !== 'default_couple') {
      // Create Couple document if it was missing
      couple = new Couple({
        _id: coupleId,
        partner1: users[0]?._id,
        partner2: users[1]?._id
      });
      await couple.save();
    }

    res.json({
      coupleId,
      names: couple?.names || '',
      relationshipDate: couple?.relationshipDate || null,
      spotifyPlaylist: couple?.spotifyPlaylist || 'https://open.spotify.com/embed/playlist/37i9dQZF1DX5YxZ2718Eld?utm_source=generator&theme=0',
      partnerNames
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCoupleInfo = async (req, res, next) => {
  try {
    const coupleId = req.coupleId;
    const { names, relationshipDate, spotifyPlaylist } = req.body;

    let couple = await Couple.findById(coupleId);
    if (!couple) {
      if (coupleId === 'default_couple') {
        throw new ApiError(400, 'Não é possível editar a conta de casal predefinida. Por favor, conecte a sua namorada primeiro.');
      }
      couple = new Couple({ _id: coupleId, partner1: req.user.id });
    }

    if (names !== undefined) couple.names = names;
    if (relationshipDate !== undefined) couple.relationshipDate = relationshipDate ? new Date(relationshipDate) : null;
    if (spotifyPlaylist !== undefined) couple.spotifyPlaylist = spotifyPlaylist;

    await couple.save();

    const users = await User.find({ coupleId });
    const partnerNames = users.map(u => u.username);

    res.json({
      coupleId,
      names: couple.names,
      relationshipDate: couple.relationshipDate,
      spotifyPlaylist: couple.spotifyPlaylist,
      partnerNames
    });
  } catch (error) {
    next(error);
  }
};

exports.linkCouple = async (req, res, next) => {
  try {
    const { inviteToken } = req.body;
    if (!inviteToken || inviteToken.trim() === '') {
      throw new ApiError(400, 'O token de convite é obrigatório.');
    }

    // Try to find a user that has this coupleId or whose username/email is inviteToken
    let targetUser = await User.findOne({
      $or: [
        { coupleId: inviteToken.trim() },
        { username: inviteToken.trim() },
        { email: inviteToken.trim() }
      ]
    });

    if (!targetUser) {
      throw new ApiError(404, 'Nenhum parceiro encontrado com o código/nome fornecido.');
    }

    if (targetUser._id.toString() === req.user.id.toString()) {
      throw new ApiError(400, 'Não te podes conectar a ti próprio!');
    }

    let targetCoupleId = targetUser.coupleId;

    if (targetCoupleId === 'default_couple') {
      // Create a new Couple document and link both
      const newCouple = new Couple({
        partner1: targetUser._id,
        partner2: req.user.id
      });
      await newCouple.save();
      targetCoupleId = newCouple._id;
      
      // Update partner
      targetUser.coupleId = targetCoupleId;
      await targetUser.save();
    } else {
      // Just update the Couple record to set us as partner2 if not set
      const couple = await Couple.findById(targetCoupleId);
      if (couple) {
        if (!couple.partner2) {
          couple.partner2 = req.user.id;
          await couple.save();
        } else if (couple.partner1.toString() !== req.user.id.toString() && couple.partner2.toString() !== req.user.id.toString()) {
          // Both slots filled, but maybe we can overwrite or throw error
          // Let's set us as partner2
          couple.partner2 = req.user.id;
          await couple.save();
        }
      } else {
        const newCouple = new Couple({
          _id: targetCoupleId,
          partner1: targetUser._id,
          partner2: req.user.id
        });
        await newCouple.save();
      }
    }

    // Update current user's coupleId
    const currentUser = await User.findById(req.user.id);
    currentUser.coupleId = targetCoupleId;
    await currentUser.save();

    res.json({
      message: 'Casal conectado com sucesso! ❤️',
      coupleId: targetCoupleId
    });
  } catch (error) {
    next(error);
  }
};
