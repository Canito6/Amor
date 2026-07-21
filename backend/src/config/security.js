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
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 150, // Máximo de 150 pedidos por IP por janela de 15 min
  message: { error: 'Limite de pedidos excedido. Por favor, tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Ignora rotas de autenticação para evitar dupla penalização, visto que estas já têm o seu próprio limitador estrito
  skip: (req) => {
    const strictAuthPaths = [
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/verify-login',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/forcar-mudanca-password'
    ];
    return req.originalUrl && strictAuthPaths.some(path => req.originalUrl.startsWith(path));
  },
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
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.spotifycdn.com", "https://api.dicebear.com"],
        frameSrc: ["'self'", "https://open.spotify.com"],
        connectSrc: ["'self'", "https://api.cloudinary.com"]
      }
    }
  }));

  // 2. Proteção contra NoSQL Injection
  app.use(mongoSanitizeMiddleware);

  // 3. Rate Limiting específico e geral para as rotas da API
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/verify-login', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/auth/reset-password', authLimiter);
  app.use('/api/auth/forcar-mudanca-password', authLimiter);
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
