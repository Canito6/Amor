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

// Limitador específico para tentativas de autenticação (/api/auth/*)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10, // Máximo de 10 tentativas por IP por janela de 15 min
  message: { error: 'Limite de tentativas de autenticação excedido. Por favor, tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador geral de acessos para proteger a API (/api/*)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 60, // Máximo de 60 pedidos por IP por minuto
  message: { error: 'Limite de pedidos excedido. Por favor, abrande as solicitações.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Ignora rotas de autenticação para evitar dupla penalização, visto que estas já têm o seu próprio limitador estrito
  skip: (req) => req.originalUrl && req.originalUrl.startsWith('/api/auth'),
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

  // 3. Rate Limiting específico e geral para as rotas da API
  app.use('/api/auth', authLimiter);
  app.use('/api', generalLimiter);

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
