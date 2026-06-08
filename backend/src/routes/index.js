const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// Helper recursivo para encontrar ficheiros de rotas (.routes.js)
function scanFiles(dir, suffix) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(scanFiles(filePath, suffix));
    } else if (file.endsWith(suffix)) {
      results.push(filePath);
    }
  }
  return results;
}

const featuresDir = path.join(__dirname, '../features');
const routeFiles = scanFiles(featuresDir, '.routes.js');

// Tabela de mapeamento para preservar compatibilidade com os endpoints HTTP do frontend
const routePrefixes = {
  'auth.routes.js': '/auth',
  'couple.routes.js': '/auth',
  'admin.routes.js': '/admin',
  'message.routes.js': '/messages',
  'photo.routes.js': '/photos',
  'memory.routes.js': '/memories',
  'album.routes.js': '/albums',
  'quiz.routes.js': '/quizzes',
  'event.routes.js': '/events',
  'tab.routes.js': '/tabs',
  'scratchCard.routes.js': '/fun/scratch-cards',
  'decisionWheel.routes.js': '/fun/decision-wheels',
  'bucketItem.routes.js': '/fun/bucket-items',
  'coupon.routes.js': '/fun/coupons',
  'openWhen.routes.js': '/fun/letters',
  'jar.routes.js': '/fun/jar-notes',
  'likely.routes.js': '/fun/likely-questions',
  'dailyCheckIn.routes.js': '/daily-checkin'
};

for (const file of routeFiles) {
  const filename = path.basename(file);
  const routeModule = require(file);
  
  // Obter o prefixo do mapeamento ou usar o nome base do ficheiro como fallback dinâmico
  let prefix = routePrefixes[filename];
  if (!prefix) {
    const baseName = filename.replace('.routes.js', '');
    prefix = `/${baseName.toLowerCase()}`;
  }
  
  router.use(prefix, routeModule);
}

module.exports = router;
