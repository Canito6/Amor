const { Resend } = require('resend');
const User = require('../../models/auth/userModel');

// Inicializar cliente do Resend com a chave de API das variáveis de ambiente
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_dev');

// Helper genérico para enviar e-mails
const sendEmail = async (to, subject, text, html) => {
  try {
    const fromAddress = process.env.EMAIL_FROM || 'O Nosso Cantinho ❤️ <onboarding@resend.dev>';
    const payload = {
      from: fromAddress,
      to,
      subject
    };
    if (html) payload.html = html;
    if (text) payload.text = text;

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error('❌ Erro ao enviar email via Resend:', error);
      return;
    }

    console.log(`✉️ Email enviado com sucesso para ${to}`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
  }
};

// Helper para notificar o outro parceiro do casal
const notifyCouplePartner = async (senderUsername, coupleId, subject, text, html) => {
  try {
    // Procurar utilizadores no mesmo casal que não sejam o próprio remetente
    const partners = await User.find({ coupleId, username: { $ne: senderUsername } });
    for (const partner of partners) {
      if (partner.email) {
        await sendEmail(partner.email, subject, text, html);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao notificar parceiro por email:', error);
  }
};

module.exports = { resend, sendEmail, notifyCouplePartner };
