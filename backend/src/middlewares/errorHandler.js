const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.stack = err.stack;
  error.statusCode = err.statusCode || 500;
  
  // 1. Identificar e traduzir erros conhecidos em ApiErrors operacionais

  // A. Erros de Validação do Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(val => val.message);
    error = new ApiError(400, `Erro de validação de dados: ${messages.join(', ')}`);
  }

  // B. Erro de Formato de ID inválido do Mongoose (CastError)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Recurso não encontrado com o ID formatado incorretamente: ${err.value}`);
  }

  // C. Erro de Duplicação de Chaves do MongoDB (ex: emails duplicados)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    const message = field ? `O campo '${field}' já está em uso.` : 'Este valor já está registado na nossa base de dados.';
    error = new ApiError(400, message);
  }

  // D. Erros de Token JWT Inválido
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Token de autenticação inválido. Por favor, faça login novamente.');
  }

  // E. Erro de Token JWT Expirado
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'A sua sessão expirou. Por favor, faça login novamente.');
  }

  // Obter o status final
  const statusCode = error.statusCode || 500;
  
  // Log do erro completo usando Winston logger
  // Apenas logamos como erro se for 500 (erro do sistema), caso contrário logamos como warning (erros do utilizador)
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl || req.url} - Status: ${statusCode}`, error);
  } else {
    logger.warn(`${req.method} ${req.originalUrl || req.url} - Status: ${statusCode} - Mensagem: ${error.message}`);
  }

  // Definir a mensagem limpa
  // Se for operacional (tratado por nós), mostramos a mensagem. Caso contrário, ocultamos em produção.
  const isDev = process.env.NODE_ENV === 'development';
  const cleanMessage = error.isOperational ? error.message : 'Ocorreu um erro interno no servidor.';

  res.status(statusCode).json({
    error: cleanMessage,
    ...(isDev && { 
      stack: error.stack,
      rawError: err
    })
  });
};

module.exports = errorHandler;
