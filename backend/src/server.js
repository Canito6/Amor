const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares (Regras de segurança e formato de dados)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Rotas de Autenticação (Login e Registo)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// NOVO: Rotas de Administrador
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Novas Rotas Funcionais (Mensagens, Fotos, Memórias)
const messageRoutes = require('./routes/messages');
const photoRoutes = require('./routes/photos');
const memoryRoutes = require('./routes/memories');
const albumRoutes = require('./routes/albums');
const quizRoutes = require('./routes/quizzes');
const eventRoutes = require('./routes/events');
const tabRoutes = require('./routes/tabs');

app.use('/api/messages', messageRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tabs', tabRoutes);

// Ligação ao MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Ligado com sucesso ao MongoDB Atlas!');
    // Iniciar verificação de cápsulas desbloqueadas no arranque
    checkUnlockedTimeCapsules();
  })
  .catch((err) => console.error('❌ Erro ao ligar ao MongoDB:', err));

// Rota de teste inicial
app.get('/', (req, res) => {
  res.send('O backend do nosso site está vivo e a funcionar!');
});

// Importar modelos e mailer para o processamento de cápsulas do tempo
const Memory = require('./models/Memory');
const User = require('./models/User');
const { sendEmail } = require('./utils/mailer');

const checkUnlockedTimeCapsules = async () => {
  try {
    const now = new Date();
    // Procurar cápsulas do tempo desbloqueadas e que não tenham sido notificadas
    const unlockedCapsules = await Memory.find({
      isTimeCapsule: true,
      unlockDate: { $lte: now },
      notified: { $ne: true }
    });

    for (const capsule of unlockedCapsules) {
      const users = await User.find({ coupleId: capsule.coupleId });
      
      for (const user of users) {
        if (user.email) {
          await sendEmail(
            user.email,
            '🔒 Cápsula do Tempo Desbloqueada! ❤️',
            `Olá ${user.username}!\n\nUma cápsula do tempo criada por ${capsule.createdBy} em ${new Date(capsule.createdAt).toLocaleDateString()} acabou de ser desbloqueada!\n\n"${capsule.title}"\n\nAcede ao site para a ler!`,
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px; text-align: center;">
                <h2 style="color: #ff4d6d;">🔒 Cápsula do Tempo Aberta! ❤️</h2>
                <p style="font-size: 16px; color: #555;">Uma Cápsula do Tempo especial, guardada com muito amor, acabou de se abrir!</p>
                <div style="background-color: #fff0f3; padding: 15px; margin: 20px 0; text-align: center; border-radius: 8px;">
                  <h3 style="margin: 0; color: #ff4d6d;">"${capsule.title}"</h3>
                  <p style="margin: 5px 0 0 0; font-size: 14px; color: #777;">Criada por <strong>${capsule.createdBy}</strong> em ${new Date(capsule.createdAt).toLocaleDateString('pt-PT')}</p>
                </div>
                <p style="font-size: 14px; color: #999;">Acede ao vosso cantinho agora para ler o que estava guardado nesta cápsula do tempo.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background-color: #ff4d6d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 6px rgba(255, 77, 109, 0.2);">Abrir Cápsula no Site</a>
              </div>
            `
          );
        }
      }

      capsule.notified = true;
      await capsule.save();
    }
  } catch (error) {
    console.error('❌ Erro no processamento automático de Cápsulas do Tempo:', error);
  }
};

// Verificar todas as cápsulas a cada 2 minutos
setInterval(checkUnlockedTimeCapsules, 2 * 60 * 1000);

// Arrancar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
});