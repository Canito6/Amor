const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { transporter } = require('../../services/mailer');
const User = require('../../models/User');
const ApiError = require('../../utils/apiError');
const { setTokenCookie } = require('./authHelper');

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'Não encontrámos nenhuma conta com este email.');
    }

    const codigoRecuperacao = crypto.randomInt(100000, 1000000).toString();

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

    // Guardar token num cookie HTTP-Only seguro
    setTokenCookie(res, token);

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
