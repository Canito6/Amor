const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const eventBus = require('../../utils/eventBus');
const User = require('../../models/auth/userModel');
const ApiError = require('../../utils/apiError');
const { setTokenCookie } = require('./authHelper');

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // [SEGURANÇA - VULN-002] Resposta genérica de sucesso para evitar enumeração de emails
      return res.status(200).json({ message: 'Se o email estiver associado a uma conta, receberás o teu código de recuperação.' });
    }

    const codigoRecuperacao = crypto.randomInt(100000, 1000000).toString();

    user.resetPasswordToken = codigoRecuperacao;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora de validade
    user.resetPasswordAttempts = 0; // [SEGURANÇA - VULN-001] Reset de tentativas
    await user.save();

    eventBus.emit('mail:send', {
      to: user.email,
      subject: '❤️ Código de Recuperação - O Nosso Cantinho',
      text: `Olá ${user.username},\n\nO teu código para recuperar a password é: ${codigoRecuperacao}\n\nEste código é válido por 1 hora. Insere-o na página do site para criares uma password nova.\n\nSe não pediste isto, podes ignorar este email.`
    });
    // [SEGURANÇA - VULN-002] Mesma resposta genérica de sucesso
    res.status(200).json({ message: 'Se o email estiver associado a uma conta, receberás o teu código de recuperação.' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, codigo, novaPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, 'O código é inválido ou já expirou!');
    }

    // [SEGURANÇA - VULN-001] Validar se existe um pedido de reset ativo e dentro do prazo
    if (!user.resetPasswordToken || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      throw new ApiError(400, 'Não existe nenhum pedido de redefinição ativo para este email ou o código expirou.');
    }

    if (user.resetPasswordToken !== codigo) {
      user.resetPasswordAttempts += 1;
      if (user.resetPasswordAttempts >= 3) {
        // [SEGURANÇA - VULN-001] Limita brute force eliminando o código após 3 erros consecutivos
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordAttempts = 0;
        await user.save();
        throw new ApiError(400, 'Excedeu o limite de tentativas falhadas. Por favor, peça um novo código.');
      }
      await user.save();
      throw new ApiError(400, 'O código é inválido ou já expirou!');
    }

    user.password = novaPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0; // [SEGURANÇA - VULN-001] Limpar tentativas com sucesso
    await user.save();

    res.json({ message: 'Password alterada com sucesso! Já podes fazer login.' });
  } catch (error) {
    next(error);
  }
};

exports.forcarMudancaPassword = async (req, res, next) => {
  try {
    const { userId, novaPassword } = req.body;

    // [SEGURANÇA] Obter e validar o token temporário (cookie ou Authorization header)
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Acesso negado. Token temporário ausente.');
    }

    let decodificado;
    try {
      decodificado = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, 'Token temporário inválido ou expirado.');
    }

    // [SEGURANÇA] Validar se o token é de redefinição temporária e se coincide com o userId
    if (!decodificado.tempChangePassword || decodificado.id !== userId) {
      throw new ApiError(403, 'Acesso negado. Ação não autorizada para este utilizador.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado.');
    }

    // [SEGURANÇA] Garantir que o utilizador de facto necessita de mudar a password
    if (!user.precisaMudarPassword) {
      throw new ApiError(400, 'Esta conta não necessita de alteração de password.');
    }

    user.password = novaPassword;
    user.precisaMudarPassword = false; // Já não precisa de mudar
    await user.save();

    // Faz logo o login automático e devolve o token definitivo
    const tokenDefinitivo = jwt.sign(
      { id: user._id, username: user.username, role: user.role, coupleId: user.coupleId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Guardar token num cookie HTTP-Only seguro
    setTokenCookie(res, tokenDefinitivo);

    res.json({ 
      message: 'Password definida com sucesso!', 
      token: tokenDefinitivo, 
      username: user.username,
      role: user.role,
      coupleId: user.coupleId
    });
  } catch (error) {
    next(error);
  }
};
