const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log the complete error stack using Winston logger
  logger.error(`${req.method} ${req.originalUrl || req.url} - Status: ${statusCode}`, err);

  // Return clean, safe error messages to clients without leaking internals
  const cleanMessage = err.isOperational ? err.message : 'Ocorreu um erro interno no servidor.';

  res.status(statusCode).json({
    error: cleanMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
