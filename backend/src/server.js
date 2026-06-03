require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const configureSecurity = require('./config/security');
const apiRouter = require('./routes');

const app = express();
app.set('trust proxy', 1); // Confiar no primeiro proxy (ex: ngrok)
const PORT = process.env.PORT || 5000;

// 1. Ligação ao MongoDB Atlas
connectDB();

// 2. Middlewares base
app.use(cookieParser());
app.use(express.json());

// 3. Registo de acessos HTTP (Morgan integrado com Winston)
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 4. Configurações de Segurança e Sanitização de Inputs
configureSecurity(app);

// 5. Servir ficheiros estáticos do frontend com cache de longa duração
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

// 6. Registar as Rotas da API sob /api
app.use('/api', apiRouter);

// 7. Fallback para o React Router
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

// 8. Middleware Centralizado de Controlo de Erros
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  socket.on('join-couple', (coupleId) => {
    if (coupleId) {
      socket.join(coupleId);
      logger.info(`User socket joined couple room: ${coupleId}`);
    }
  });
});

app.set('io', io);

// 9. Inicialização da Escuta de Porta (ignorada em ambiente de testes)
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`🚀 Servidor a correr na porta ${PORT}`);
  });
}

module.exports = app;