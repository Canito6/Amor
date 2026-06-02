const xss = require('xss');

/**
 * Função utilitária para limpar recursivamente strings em objetos.
 * Remove ou neutraliza tags script, atributos on* (ex: onclick), etc.
 */
const sanitizeInput = (value) => {
  if (typeof value === 'string') {
    return xss(value);
  }
  
  if (value !== null && typeof value === 'object') {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        value[key] = sanitizeInput(value[key]);
      }
    }
  }
  
  return value;
};

/**
 * Middleware para sanitizar dados das requisições (body, query e params) contra XSS.
 */
const xssSanitizer = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};

module.exports = xssSanitizer;
