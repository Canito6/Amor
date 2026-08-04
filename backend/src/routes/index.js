const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// Helper recursivo para encontrar ficheiros de rotas (*Routes.js)
function scanFiles(dir, suffix) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(scanFiles(filePath, suffix));
    } else if (file.endsWith(suffix) && file !== 'index.js') {
      results.push(filePath);
    }
  }
  return results;
}

const routeFiles = scanFiles(__dirname, 'Routes.js');

// Tabela de mapeamento para preservar compatibilidade com os endpoints HTTP do frontend
const routePrefixes = {
  'authRoutes.js': '/auth',
  'coupleRoutes.js': '/auth',
  'coupleExportRoutes.js': '/couple',
  'userRoutes.js': '/auth',
  'statsRoutes.js': '/auth',
  'adminRoutes.js': '/admin',
  'messageRoutes.js': '/messages',
  'photoRoutes.js': '/photos',
  'memoryRoutes.js': '/memories',
  'albumRoutes.js': '/albums',
  'quizRoutes.js': '/quizzes',
  'eventRoutes.js': '/events',
  'tabRoutes.js': '/tabs',
  'scratchCardRoutes.js': '/fun/scratch-cards',
  'decisionWheelRoutes.js': '/fun/decision-wheels',
  'bucketItemRoutes.js': '/fun/bucket-items',
  'couponRoutes.js': '/fun/coupons',
  'openWhenRoutes.js': '/fun/letters',
  'jarRoutes.js': '/fun/jar-notes',
  'likelyRoutes.js': '/fun/likely-questions',
  'dailyCheckInRoutes.js': '/daily-checkin',
  'cycleRoutes.js': '/cycle',
  'songRoutes.js': '/couple/song',
  'gameScoreRoutes.js': '/fun/game-scores',
  'gameSessionRoutes.js': '/fun/game-sessions',
  'truthOrDareRoutes.js': '/fun/truth-or-dare',
  'battleshipRoutes.js': '/fun/battleship',
  'wordleRoutes.js': '/fun/wordle',
  'dateNightRoutes.js': '/fun/date-night'
};

// Endpoint público leve de health-check para serviços externos de ping (ex: UptimeRobot / cron-job.org)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

for (const file of routeFiles) {
  const filename = path.basename(file);
  const routeModule = require(file);
  
  // Obter o prefixo do mapeamento ou usar o nome base do ficheiro como fallback dinâmico
  let prefix = routePrefixes[filename];
  if (!prefix) {
    const baseName = filename.replace('Routes.js', '');
    prefix = `/${baseName.toLowerCase()}`;
  }
  
  router.use(prefix, routeModule);
}

module.exports = router;
