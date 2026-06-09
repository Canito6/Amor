const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./utils/logger');
const configureSecurity = require('./config/security');
const apiRouter = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.set('trust proxy', 1); // Confiar no primeiro proxy (ex: ngrok)

// 1. Middlewares base
app.use(cookieParser());
app.use(express.json());

// 2. Registo de acessos HTTP (Morgan integrado com Winston)
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 3. Configurações de Segurança e Sanitização de Inputs
configureSecurity(app);

// 4. Servir ficheiros estáticos do frontend com cache de longa duração
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath, {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    // Cache permanente para assets compilados do Vite
    if (filePath.includes(path.sep + 'assets' + path.sep)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// 5. Registar as Rotas da API sob /api
app.use('/api', apiRouter);

// 6. Fallback para o React Router
app.get('*any', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('O backend do nosso site está vivo e a funcionar! (Dica: faça o build do frontend para ver o site aqui)');
    }
  });
});

// 7. Middleware Centralizado de Controlo de Erros
app.use(errorHandler);

module.exports = app;
