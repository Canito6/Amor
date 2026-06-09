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
