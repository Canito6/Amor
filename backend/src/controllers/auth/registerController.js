const User = require('../../models/auth/userModel');
const Couple = require('../../models/couple/coupleModel');
const ApiError = require('../../utils/apiError');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, codigoAdmin, loginSecurityMethod, inviteCode } = req.body;
    
    // Verifica se o nome ou o email já estão a ser usados
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      throw new ApiError(400, 'Este utilizador ou email já existe!');
    }

    // A MAGIA DO ADMIN: Se o código secreto inserido for o do .env, o cargo passa a ser 'admin'
    // SEGURANÇA: Sem fallback hardcoded - se ADMIN_SECRET_CODE não estiver definido, ninguém pode ser admin
    const adminSecret = process.env.ADMIN_SECRET_CODE;
    const role = (adminSecret && codigoAdmin === adminSecret) ? 'admin' : 'user';

    const validSecurityMethod = loginSecurityMethod === 'email' ? 'email' : 'direct';

    const user = new User({ 
      username, 
      email, 
      password, 
      role,
      loginSecurityMethod: validSecurityMethod
    });

    if (inviteCode && inviteCode.trim() !== '') {
      // Find the couple by inviteCode (which is the coupleId)
      const couple = await Couple.findById(inviteCode);
      if (couple) {
        // [SEGURANÇA] Impedir associação a casais que já estão completos
        if (couple.partner2) {
          throw new ApiError(400, 'Este código de convite pertence a um casal que já está completo.');
        }
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
