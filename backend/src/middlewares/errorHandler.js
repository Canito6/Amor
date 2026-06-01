const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log the complete error stack on the server side
  console.error(`[ERR] ${req.method} ${req.originalUrl || req.url} - Status: ${statusCode}`);
  console.error(err.stack || err);

  // Return clean, safe error messages to clients without leaking internals
  const cleanMessage = err.isOperational ? err.message : 'Ocorreu um erro interno no servidor.';

  res.status(statusCode).json({
    error: cleanMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
