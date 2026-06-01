const express = require('express');
const Message = require('../models/Message');
const { verificarToken } = require('../middlewares/authMiddleware');
const { notifyCouplePartner } = require('../utils/mailer');
const router = express.Router();

// 1. Obter todas as mensagens (Ordenadas por data de criação - mais antigas primeiro)
router.get('/', verificarToken, async (req, res) => {
  try {
    const messages = await Message.find({ coupleId: req.coupleId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar mensagens.' });
  }
});

// 2. Criar uma nova mensagem
router.post('/', verificarToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'O conteúdo da mensagem não pode estar vazio.' });
    }
    if (content.trim().length > 5000) {
      return res.status(400).json({ error: 'A mensagem não pode ter mais de 5000 caracteres.' });
    }

    const message = new Message({
      sender: req.user.username,
      content: content.trim(),
      coupleId: req.coupleId
    });

    await message.save();

    // Notificar parceiro por e-mail em background
    notifyCouplePartner(
      req.user.username,
      req.coupleId,
      '❤️ Nova Mensagem no Nosso Cantinho!',
      `Olá!\n\nO/A ${req.user.username} enviou uma nova mensagem no vosso diário:\n\n"${content.trim()}"\n\nAcede ao site para ver e responder!`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px; text-align: center;">
          <h2 style="color: #ff4d6d;">Nova Mensagem! ❤️</h2>
          <p style="font-size: 16px; color: #555;">O/A <strong>${req.user.username}</strong> deixou-te um miminho no vosso diário:</p>
          <div style="background-color: #fff0f3; border-left: 4px solid #ff4d6d; padding: 15px; margin: 20px 0; text-align: left; border-radius: 4px; font-style: italic; color: #333;">
            "${content.trim()}"
          </div>
          <p style="font-size: 14px; color: #999;">Clica no botão abaixo para veres e responderes no site.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background-color: #ff4d6d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 6px rgba(255, 77, 109, 0.2);">Ver no Nosso Cantinho</a>
        </div>
      `
    ).catch(err => console.error("Erro ao enviar email de notificação:", err));

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao enviar mensagem.' });
  }
});

// 3. Editar uma mensagem (Apenas o autor pode editar)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'O conteúdo não pode estar vazio.' });
    }
    if (content.trim().length > 5000) {
      return res.status(400).json({ error: 'A mensagem não pode ter mais de 5000 caracteres.' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada.' });
    }

    if (message.coupleId !== req.coupleId) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    if (message.sender !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas o autor pode editar esta mensagem.' });
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar mensagem.' });
  }
});

// 4. Reagir a uma mensagem com Emoji
router.put('/:id/react', verificarToken, async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ error: 'Emoji é obrigatório.' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada.' });
    }

    if (message.coupleId !== req.coupleId) {
      return res.status(403).json({ error: 'Não autorizado.' });
    }

    // Toggle reaction: se o utilizador já reagiu com o mesmo emoji, retira-o. Caso contrário, adiciona/atualiza.
    const existingIndex = message.reactions.findIndex(r => r.username === req.user.username);
    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ emoji, username: req.user.username });
    }

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reagir à mensagem.' });
  }
});

// 5. Apagar uma mensagem (Apenas o autor ou admin pode apagar)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada.' });
    }

    // Garante que o utilizador pertence ao mesmo casal da mensagem (ou é admin)
    if (message.coupleId !== req.coupleId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para aceder a esta mensagem.' });
    }

    // Verifica se é o autor ou se é um admin para poder apagar
    if (message.sender !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Não tens permissão para apagar esta mensagem.' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mensagem apagada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao apagar mensagem.' });
  }
});

module.exports = router;
