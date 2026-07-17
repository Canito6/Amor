const webpush = require('web-push');
const PushSubscription = require('../../models/auth/pushSubscriptionModel');

const configureWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  let email = process.env.EMAIL_USER || 'miguelcanito55@gmail.com';

  if (!publicKey || !privateKey) {
    console.warn('⚠️ Chaves VAPID não configuradas nas variáveis de ambiente. As notificações push não funcionarão.');
    return false;
  }

  if (email && !email.startsWith('mailto:') && !email.startsWith('http://') && !email.startsWith('https://')) {
    email = `mailto:${email}`;
  }

  webpush.setVapidDetails(email, publicKey, privateKey);
  return true;
};

const sendPushNotification = async (userId, title, body, url = '/dashboard') => {
  try {
    // Se estivermos em testes e não houver chaves, podemos simplesmente logar
    if (process.env.NODE_ENV === 'test' && (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY)) {
      console.log(`[PUSH MOCK] Notificação para ${userId}: ${title} - ${body}`);
      return;
    }

    const subscriptions = await PushSubscription.find({ userId });
    if (!subscriptions || subscriptions.length === 0) return;

    // Payload genérico de notificação para segurança (sem detalhes privados)
    const payload = JSON.stringify({ title, body, url });

    const sendPromises = subscriptions.map(sub => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.keys.auth,
          p256dh: sub.keys.p256dh
        }
      };

      return webpush.sendNotification(pushConfig, payload)
        .catch(async (error) => {
          // Se a subscrição expirou ou é inválida (410 Gone ou 404 Not Found), removemos da BD
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Removendo subscrição inválida/expirada: ${sub.endpoint}`);
            await PushSubscription.deleteOne({ _id: sub._id });
          } else {
            console.error('Erro ao disparar notificação push:', error.message || error);
          }
        });
    });

    // Fire-and-forget: resolve as promessas em background sem bloquear o fluxo principal
    Promise.all(sendPromises).catch(err => console.error('Erro ao resolver envio de pushes:', err));
  } catch (error) {
    console.error('Erro geral no sendPushNotification:', error);
  }
};

module.exports = {
  configureWebPush,
  sendPushNotification
};
