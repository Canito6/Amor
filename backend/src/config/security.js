const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
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
  next();
};

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

  // 3. Configuração de CORS com Credenciais
  const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  };
  app.use(cors(corsOptions));

  // 4. Sanitizador de inputs contra XSS
  app.use(xssSanitizer);

  // 5. Prevenção de poluição de parâmetros HTTP (HPP)
  app.use(hpp());
};

module.exports = configureSecurity;
