const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importamos o molde de utilizador
const router = express.Router();

// 1. ROTA DE REGISTO (Para criar as vossas contas)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Verifica se o nome já está a ser usado
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'Este utilizador já existe!' });
    }

    // Cria e guarda o utilizador (a password é encriptada automaticamente pelo User.js)
    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ message: 'Conta criada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar conta.' });
  }
});

// 2. ROTA DE LOGIN (Para entrar no site)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Procura quem está a tentar entrar
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado!' });
    }

    // Compara a password escrita com a encriptada na base de dados
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Password incorreta!' });
    }

    // Cria o "bilhete" de acesso (Token) válido por 7 dias
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      message: 'Login feito com sucesso!', 
      token, 
      username: user.username 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

module.exports = router;