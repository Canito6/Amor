const nodemailer = require('nodemailer');
const User = require('../models/User');

// Configurar o nosso carteiro virtual com os dados do .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper genérico para enviar e-mails
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"O Nosso Cantinho ❤️" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Email enviado com sucesso para ${to}`);
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

module.exports = { transporter, sendEmail, notifyCouplePartner };
