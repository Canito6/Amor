const Memory = require('../models/Memory');
const User = require('../models/User');
const { sendEmail } = require('./mailer');

const checkUnlockedTimeCapsules = async () => {
  try {
    const now = new Date();
    // Procurar cápsulas do tempo desbloqueadas e que não tenham sido notificadas
    const unlockedCapsules = await Memory.find({
      isTimeCapsule: true,
      unlockDate: { $lte: now },
      notified: { $ne: true }
    });

    if (unlockedCapsules.length === 0) return;

    // Obter todos os coupleIds únicos
    const coupleIds = [...new Set(unlockedCapsules.map(c => c.coupleId))];

    // Otimização: Bulk query de utilizadores para evitar o problema N+1
    const users = await User.find({ coupleId: { $in: coupleIds } });

    // Agrupar utilizadores por coupleId em memória
    const usersByCouple = users.reduce((acc, user) => {
      if (!acc[user.coupleId]) {
        acc[user.coupleId] = [];
      }
      acc[user.coupleId].push(user);
      return acc;
    }, {});

    const emailTasks = [];
    const saveTasks = [];

    for (const capsule of unlockedCapsules) {
      const coupleUsers = usersByCouple[capsule.coupleId] || [];
      
      for (const user of coupleUsers) {
        if (user.email) {
          // Otimização: Envio de e-mails em paralelo
          emailTasks.push(
            sendEmail(
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
            ).catch(err => console.error(`❌ Erro ao enviar email para ${user.email} (Cápsula: ${capsule._id}):`, err))
          );
        }
      }

      capsule.notified = true;
      saveTasks.push(capsule.save());
    }

    // Aguardar conclusão das tarefas paralelas
    await Promise.all([
      Promise.allSettled(emailTasks),
      Promise.all(saveTasks)
    ]);
    
  } catch (error) {
    console.error('❌ Erro no processamento automático de Cápsulas do Tempo:', error);
  }
};

const startTimeCapsuleWorker = () => {
  if (process.env.NODE_ENV === 'test') return;
  // Executar uma vez no arranque
  checkUnlockedTimeCapsules();
  
  // Verificar todas as cápsulas a cada 2 minutos
  setInterval(checkUnlockedTimeCapsules, 2 * 60 * 1000);
};

module.exports = {
  startTimeCapsuleWorker
};
