require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../src/models/auth/userModel');

/**
 * Ferramenta Administrativa Global de Gestão de Contas
 * 
 * Exemplos de utilização:
 *  - Listar utilizadores:
 *      node scripts/resetUserAccount.js --list
 * 
 *  - Desbloquear todas as contas bloqueadas:
 *      node scripts/resetUserAccount.js --all
 * 
 *  - Desbloquear um utilizador específico (por username ou email):
 *      node scripts/resetUserAccount.js lara
 * 
 *  - Desbloquear E redefinir a password de um utilizador:
 *      node scripts/resetUserAccount.js lara novaPassword123
 */

async function main() {
  const args = process.argv.slice(2);
  const target = args[0];
  const newPassword = args[1];

  if (!target) {
    console.log(`
ℹ️  Uso do comando:
  node scripts/resetUserAccount.js --list
  node scripts/resetUserAccount.js --all
  node scripts/resetUserAccount.js <username_ou_email> [nova_password]
    `);
    process.exit(0);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Ligado à base de dados MongoDB...');

    // 1. Opção de listagem
    if (target === '--list') {
      const users = await User.find({}, 'username email role loginAttempts lockUntil precisaMudarPassword loginSecurityMethod coupleId');
      console.log('\n--- 👥 LISTA DE UTILIZADORES REGISTADOS ---');
      users.forEach(u => {
        const isLocked = u.lockUntil && new Date(u.lockUntil).getTime() > Date.now();
        console.log(`• Username: ${u.username}`);
        console.log(`  Email:    ${u.email}`);
        console.log(`  Role:     ${u.role}`);
        console.log(`  Estado:   ${isLocked ? `🔒 BLOQUEADO (até ${u.lockUntil.toISOString()})` : '🟢 Ativo / Livre'}`);
        console.log(`  Tentativas falhadas: ${u.loginAttempts}`);
        console.log(`  Método Segurança:    ${u.loginSecurityMethod || 'direct'}`);
        console.log('--------------------------------------------------');
      });
      await mongoose.disconnect();
      return;
    }

    // 2. Opção de desbloqueio geral
    if (target === '--all') {
      const result = await User.updateMany(
        {},
        {
          $set: {
            loginAttempts: 0,
            precisaMudarPassword: false
          },
          $unset: {
            lockUntil: 1,
            loginVerificationCode: 1,
            loginVerificationExpires: 1
          }
        }
      );
      console.log(`✅ ${result.modifiedCount} conta(s) desbloqueada(s) e limpa(s) com sucesso!`);
      await mongoose.disconnect();
      return;
    }

    // 3. Desbloquear/Redefinir utilizador específico
    const searchRegex = new RegExp(`^${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const user = await User.findOne({
      $or: [{ username: searchRegex }, { email: searchRegex }]
    });

    if (!user) {
      console.error(`❌ Utilizador "${target}" não foi encontrado na base de dados.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.precisaMudarPassword = false;
    user.loginVerificationCode = undefined;
    user.loginVerificationExpires = undefined;

    if (newPassword) {
      user.password = newPassword;
      console.log(`🔑 Nova password definida para o utilizador "${user.username}".`);
    }

    await user.save();
    console.log(`\n🎉 Sucesso! A conta do utilizador "${user.username}" (${user.email}) foi completamente desbloqueada e redefinida.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erro durante a execução:', err);
    process.exit(1);
  }
}

main();
