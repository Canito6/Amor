const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    // Procura todos os utilizadores, mas NÃO envia a password
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar utilizadores.' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ message: `Permissão de ${user.username} alterada para ${role}!` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar permissões.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilizador apagado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar utilizador.' });
  }
};

exports.editUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    if (email) {
      user.email = email;
    }
    
    // Se o admin escreveu uma nova password, alteramos e ativamos a obrigatoriedade de mudança
    if (password) {
      user.password = password;
      user.precisaMudarPassword = true; 
    }

    await user.save();
    res.json({ message: 'Utilizador atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar utilizador.' });
  }
};
