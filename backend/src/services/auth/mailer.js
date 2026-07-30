const { Resend } = require('resend');
const User = require('../../models/auth/userModel');

if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_dummy_key_for_dev') {
  console.warn('⚠️ ATENÇÃO: RESEND_API_KEY não definida no .env! Os e-mails do Resend não serão entregues até adicionar uma chave válida (re_...).');
}

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
      console.error('❌ Erro ao enviar email via Resend:', JSON.stringify(error, null, 2));
      if (fromAddress.includes('onboarding@resend.dev')) {
        console.warn('💡 Nota: O remetente onboarding@resend.dev apenas permite enviar e-mails para a conta proprietária do Resend no plano de testes.');
      }
      return null;
    }

    console.log(`✉️ Email enviado com sucesso para ${to}`);
    return data;
  } catch (error) {
    console.error('❌ Erro inesperado ao enviar email:', error);
    return null;
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
