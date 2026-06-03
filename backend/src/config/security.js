const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const xssSanitizer = require('../middlewares/xssSanitizer');

// Sanitizador manual compatível com Express 5 (req.query é getter-only no Express 5)
const sanitizeValue = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        sanitizeValue(obj[key]);
      }
    }
  }
  return obj;
};

const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeValue(req.body);
  if (req.params) sanitizeValue(req.params);
  if (req.query) sanitizeValue(req.query); // NOVO: Proteção contra NoSQL Injection na query string
  next();
};

// Limitador de acessos geral para proteger a API (/api/*)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 300, // Máximo de 300 pedidos por IP por janela de 15 min
  message: { error: 'Limite de pedidos excedido para esta API. Por favor, tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const configureSecurity = (app) => {
  // 1. Helmet para Headers de Segurança e CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.spotifycdn.com"],
        frameSrc: ["'self'", "https://open.spotify.com"],
        connectSrc: ["'self'", "https://api.cloudinary.com"]
      }
    }
  }));

  // 2. Proteção contra NoSQL Injection
  app.use(mongoSanitizeMiddleware);

  // 3. Rate Limiting Geral para as rotas da API
  app.use('/api', apiLimiter);

  // 4. Configuração de CORS com Credenciais
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  };
  app.use(cors(corsOptions));

  // 5. Sanitizador de inputs contra XSS
  app.use(xssSanitizer);

  // 6. Prevenção de poluição de parâmetros HTTP (HPP)
  app.use(hpp());
};

module.exports = configureSecurity;
