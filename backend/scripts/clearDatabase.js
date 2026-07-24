const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function clearDatabase() {
  console.log('🔄 A ligar à base de dados MongoDB para limpeza...');
  
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI não encontrada no ficheiro .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Ligado ao MongoDB com sucesso!');

    const collections = await mongoose.connection.db.collections();
    console.log(`\n🧹 Encontradas ${collections.length} coleções. A iniciar limpeza...\n`);

    for (const collection of collections) {
      const collectionName = collection.collectionName;
      const countBefore = await collection.countDocuments();
      await collection.deleteMany({});
      console.log(`   - Coleção [${collectionName}]: ${countBefore} documentos removidos.`);
    }

    console.log('\n✨ Base de dados limpa com sucesso! Podes agora testar em localhost do zero.\n');
  } catch (error) {
    console.error('❌ Erro ao limpar a base de dados:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Ligação ao MongoDB terminada.');
    process.exit(0);
  }
}

clearDatabase();
