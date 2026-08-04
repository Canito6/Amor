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

const isDev = process.env.NODE_ENV !== 'production';

// Limitador específico para tentativas de autenticação (/api/auth/*)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: process.env.NODE_ENV === 'test' ? 10 : (process.env.NODE_ENV === 'production' ? 15 : 100),
  message: { error: 'Limite de tentativas de autenticação excedido. Por favor, tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador geral de acessos para proteger a API (/api/*)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: process.env.NODE_ENV === 'test' ? 150 : (process.env.NODE_ENV === 'production' ? 300 : 2000),
  message: { error: 'Limite de pedidos excedido. Por favor, tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Ignora rotas de autenticação estritas para evitar dupla penalização
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

// Limitador específico para envios/uploads de fotos e ficheiros
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: process.env.NODE_ENV === 'test' ? 50 : 30, // 30 uploads por 15 min
  message: { error: 'Limite de envios/uploads excedido. Por favor, aguarde alguns minutos antes de enviar mais fotos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const configureSecurity = (app) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://amor-beryl-sigma.vercel.app',
    'http://localhost:5173',
    'http://localhost:5000'
  ].filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS não permitido para a origem: ${origin}`));
    },
    credentials: true
  };
  app.use(cors(corsOptions));

  // 2. Helmet para Headers de Segurança e CSP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://api.dicebear.com"],
        frameSrc: ["'self'", "https://www.youtube.com"],
        connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "ws://localhost:5000", "ws://localhost:5173", "wss://*", "https://api.cloudinary.com"]
      }
    }
  }));

  // 3. Proteção contra NoSQL Injection
  app.use(mongoSanitizeMiddleware);

  // 4. Rate Limiting específico e geral para as rotas da API
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/verify-login', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/auth/reset-password', authLimiter);
  app.use('/api/auth/forcar-mudanca-password', authLimiter);
  app.use('/api/photos/upload', uploadLimiter);
  app.use('/api', generalLimiter);

  // 5. Sanitizador de inputs contra XSS
  app.use(xssSanitizer);

  // 6. Prevenção de poluição de parâmetros HTTP (HPP)
  app.use(hpp());
};

module.exports = configureSecurity;
