const express = require('express');
const User = require('../models/User');
const { verificarAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// 1. Ver todos os utilizadores (Protegido por verificarAdmin)
router.get('/users', verificarAdmin, async (req, res) => {
  try {
    // Procura todos os utilizadores, mas NÃO envia a password
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao procurar utilizadores.' });
  }
});

// 2. Mudar a permissão de um utilizador (Dar ou tirar Admin)
router.put('/users/:id/role', verificarAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json({ message: `Permissão de ${user.username} alterada para ${role}!` });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar permissões.' });
  }
});

// 3. Apagar um utilizador
router.delete('/users/:id', verificarAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilizador apagado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar utilizador.' });
  }
});
// 4. Editar o email e/ou repor a password de um utilizador
router.put('/users/:id/editar', verificarAdmin, async (req, res) => {
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
});
module.exports = router;