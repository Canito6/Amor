const eventBus = require('../utils/eventBus');
const { sendEmail, notifyCouplePartner } = require('../services/auth/mailer');

// Ouvinte para envio de emails genéricos
eventBus.on('mail:send', async ({ to, subject, text, html }) => {
  await sendEmail(to, subject, text, html);
});

// Ouvinte para notificar o outro parceiro do casal por email
eventBus.on('mail:notify-partner', async ({ senderUsername, coupleId, subject, text, html }) => {
  await notifyCouplePartner(senderUsername, coupleId, subject, text, html);
});

const User = require('../models/auth/userModel');
const { sendPushNotification } = require('../services/common/pushService');

// Ouvinte para disparar notificações push quando há novos elementos no casal
eventBus.on('socket:emit-update', async ({ room, type, user, value }) => {
  try {
    const senderUsername = user;
    const coupleId = room;
    if (!senderUsername || !coupleId) return;

    // Encontrar o destinatário (o outro parceiro do casal)
    const recipient = await User.findOne({ coupleId, username: { $ne: senderUsername } });
    if (!recipient) return;

    let title = '';
    let body = '';
    let url = '/dashboard';

    switch (type) {
      case 'mensagem-created':
        title = 'Nova mensagem recebida! 💌';
        body = 'Tens uma nova mensagem no teu Cantinho ❤️';
        url = '/mensagens';
        break;
      case 'momento-created':
        title = 'Nova memória! ⏳';
        body = 'O teu amor adicionou uma nova memória!';
        url = '/memorias';
        break;
      case 'raspadinha-created':
        title = 'Nova raspadinha! 🎮';
        body = 'O teu amor criou uma nova raspadinha para ti!';
        url = '/raspadinhas';
        break;
      case 'coupon-gifted':
        title = 'Novo vale recebido! 🎟️';
        body = 'O teu amor ofereceu-te um vale!';
        url = '/vales';
        break;
      default:
        return; // Ignorar outros eventos
    }

    await sendPushNotification(recipient._id, title, body, url);
  } catch (error) {
    console.error('Erro ao processar evento para envio de push:', error);
  }
});

/**
 * Inicializa os ouvintes de eventos globais da aplicação, ligando o barramento
 * de eventos interno com a saída para o Socket.io e outras integrações.
 */
function initNotificationListener(io) {
  if (!io) {
    console.warn('⚠️ Socket.io não foi inicializado. Ouvinte de notificações desativado.');
    return;
  }

  // Ouvinte genérico para emissão direta de eventos de socket
  eventBus.on('socket:emit', ({ room, event, data }) => {
    io.to(room).emit(event, data);
  });

  // Ouvinte padronizado para eventos do tipo "update" (mood, coupons, bucket-list, etc.)
  eventBus.on('socket:emit-update', ({ room, type, user, value }) => {
    io.to(room).emit('update', { type, user, value });
  });

  console.log('✅ Ouvinte de notificações centralizado ativado.');
}

module.exports = { initNotificationListener };
