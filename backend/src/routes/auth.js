const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Importamos o molde de utilizador com o bcrypt e o role
const router = express.Router();

// Configurar o nosso carteiro virtual com os dados do .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. ROTA DE REGISTO (Atualizada para aceitar Email e criar Admin com código secreto)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, codigoAdmin } = req.body;
    
    // Verifica se o nome ou o email já estão a ser usados
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ error: 'Este utilizador ou email já existe!' });
    }

    // A MAGIA DO ADMIN: Se o código secreto inserido for 'ChefeCanito', o cargo passa a ser 'admin'
    // Caso contrário, fica o 'user' normal por defeito
    const role = codigoAdmin === 'ChefeCanito' ? 'admin' : 'user';

    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json({ message: 'Conta criada com sucesso!' });
  } catch (error) {
    console.error("🕵️ ERRO COMPLETO NO REGISTO:", error);
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
    // NOVO: Verifica se o admin forçou a mudança de password
    if (user.precisaMudarPassword) {
      return res.json({ 
        precisaMudarPassword: true, 
        userId: user._id, 
        message: 'Precisas de definir uma nova password antes de entrar.' 
      });
    }
    // Cria o "bilhete" de acesso (Token) válido por 7 dias, incluindo também o cargo (role) no bilhete!
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Login feito com sucesso!', 
      token, 
      username: user.username,
      role: user.role // Devolvemos o cargo para o Frontend saber se és Admin ou não
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// 3. ROTA: Pedir código de recuperação de password por email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Não encontrámos nenhuma conta com este email.' });
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
    console.error('Erro no forgot-password:', error);
    res.status(500).json({ error: 'Erro ao tentar enviar o email.' });
  }
});

// 4. ROTA: Redefinir a password antiga trocando pela nova usando o código enviado
router.post('/reset-password', async (req, res) => {
  try {
    const { email, codigo, novaPassword } = req.body;

    const user = await User.findOne({
      email: email,
      resetPasswordToken: codigo,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'O código é inválido ou já expirou!' });
    }

    user.password = novaPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password alterada com sucesso! Já podes fazer login.' });
  } catch (error) {
    console.error('Erro no reset-password:', error);
    res.status(500).json({ error: 'Erro ao tentar redefinir a password.' });
  }
});
// 5. ROTA: Mudar a password obrigatória após reset do Admin
router.post('/forcar-mudanca-password', async (req, res) => {
  try {
    const { userId, novaPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado.' });
    }

    user.password = novaPassword;
    user.precisaMudarPassword = false; // Já não precisa de mudar
    await user.save();

    // Faz logo o login automático e devolve o token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({ 
      message: 'Password definida com sucesso!', 
      token, 
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao tentar definir nova password.' });
  }
});
module.exports = router;