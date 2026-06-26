const eventBus = require('../../utils/eventBus');
const ApiError = require('../../utils/apiError');
const { escapeHTML } = require('../../utils/escape'); // [SEGURANÇA] Higienização de inputs para emails

class MessageService {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async createMessage(content, username, coupleId) {
    const message = await this.messageRepository.create({
      sender: username,
      content: content.trim(),
      coupleId: coupleId
    });

    // [SEGURANÇA] Escapar strings de input para evitar Stored HTML/XSS Injection no email do destinatário
    const escapedContent = escapeHTML(content.trim());
    const escapedUsername = escapeHTML(username);

    eventBus.emit('mail:notify-partner', {
      senderUsername: username,
      coupleId,
      subject: '❤️ Nova Mensagem no Nosso Cantinho!',
      text: `Olá!\n\nO/A ${username} enviou uma nova mensagem no vosso diário:\n\n"${content.trim()}"\n\nAcede ao site para ver e responder!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px; text-align: center;">
          <h2 style="color: #ff4d6d;">Nova Mensagem! ❤️</h2>
          <p style="font-size: 16px; color: #555;">O/A <strong>${escapedUsername}</strong> deixou-te um miminho no vosso diário:</p>
          <div style="background-color: #fff0f3; border-left: 4px solid #ff4d6d; padding: 15px; margin: 20px 0; text-align: left; border-radius: 4px; font-style: italic; color: #333;">
            "${escapedContent}"
          </div>
          <p style="font-size: 14px; color: #999;">Clica no botão abaixo para veres e responderes no site.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background-color: #ff4d6d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 6px rgba(255, 77, 109, 0.2);">Ver no Nosso Cantinho</a>
        </div>
      `
    });

    return message;
  }

  async editMessage(id, content, username, role, coupleId) {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new ApiError(404, 'Mensagem não encontrada.');
    }

    if (message.coupleId !== coupleId) {
      throw new ApiError(403, 'Não autorizado.');
    }

    if (message.sender !== username && role !== 'admin') {
      throw new ApiError(403, 'Apenas o autor pode editar esta mensagem.');
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    return message;
  }

  async reactToMessage(id, emoji, username, coupleId) {
    const message = await this.messageRepository.findById(id);
    if (!message) {
      throw new ApiError(404, 'Mensagem não encontrada.');
    }

    if (message.coupleId !== coupleId) {
      throw new ApiError(403, 'Não autorizado.');
    }

    const existingIndex = message.reactions.findIndex(r => r.username === username);
    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ emoji, username });
    }

    await message.save();
    return message;
  }
}

module.exports = MessageService;
