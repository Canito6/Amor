/**
 * Diagnóstico de Ambiente / Base de Dados
 * -----------------------------------------
 * Corre este script em CADA sítio onde o backend existe (o teu computador
 * local, e depois via Shell do Render no serviço em produção) e compara
 * os resultados. Se o "Host" ou os totais de documentos forem diferentes,
 * confirma que estás a apontar para bases de dados DIFERENTES — o que
 * explica passwords/definições que "não pegam" em produção.
 *
 * COMO USAR:
 *   Localmente:      cd backend && node scripts/checkDbTarget.js
 *   Em produção:      abre o "Shell" do serviço no painel do Render e corre
 *                     o mesmo comando lá dentro.
 *
 * Não imprime a MONGO_URI completa (evita expor a password da BD nos logs),
 * só o host e o nome da base de dados, que já chega para comparar.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

function redactUri(uri) {
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.hostname}${url.pathname}`;
  } catch {
    return '(não foi possível interpretar a URI)';
  }
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI não encontrada nas variáveis de ambiente deste processo.');
    process.exit(1);
  }

  console.log('🔎 A ligar usando:', redactUri(process.env.MONGO_URI));

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const conn = mongoose.connection;

    console.log('\n=== ALVO DA LIGAÇÃO ===');
    console.log('Host:           ', conn.host);
    console.log('Nome da BD:     ', conn.name);

    const collections = await conn.db.collections();
    console.log(`\n=== COLEÇÕES (${collections.length}) ===`);

    for (const col of collections) {
      const count = await col.countDocuments();
      console.log(`  ${col.collectionName.padEnd(20)} → ${count} documento(s)`);
    }

    // Mostrar utilizadores só por username/email (nunca a password) para
    // confirmar se é a mesma pessoa/conta que aparece nos dois sítios
    const users = await conn.db.collection('users').find({}, { projection: { username: 1, email: 1 } }).toArray();
    console.log('\n=== UTILIZADORES NESTA BASE DE DADOS ===');
    users.forEach(u => console.log(`  • ${u.username} <${u.email}>`));

    console.log('\n✅ Agora compara este output com o mesmo script corrido no outro ambiente.');
    console.log('   Se o "Nome da BD" ou a lista de utilizadores for diferente, são bases de dados distintas!');
  } catch (error) {
    console.error('❌ Erro ao ligar/consultar a base de dados:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
