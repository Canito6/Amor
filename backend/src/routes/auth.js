const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth');
const { validateSchema } = require('../middlewares/validationMiddleware');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Rate limiting para login/registo para evitar ataques de força bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 20, // Limite de 20 tentativas por IP por janela
  message: { error: 'Demasiadas tentativas. Por favor, tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Esquemas de Validação
const registerSchema = {
  username: { required: true, type: 'string', minLength: 3 },
  email: { required: true, type: 'string', isEmail: true },
  password: { required: true, type: 'string', minLength: 8, strongPassword: true }
};

const loginSchema = {
  username: { required: true, type: 'string' },
  password: { required: true, type: 'string' }
};

const forgotPasswordSchema = {
  email: { required: true, type: 'string', isEmail: true }
};

const resetPasswordSchema = {
  email: { required: true, type: 'string', isEmail: true },
  codigo: { required: true, type: 'string', minLength: 6 },
  novaPassword: { required: true, type: 'string', minLength: 8, strongPassword: true }
};

const forcarMudancaPasswordSchema = {
  userId: { required: true, type: 'string' },
  novaPassword: { required: true, type: 'string', minLength: 8, strongPassword: true }
};

// 1. ROTA DE REGISTO
router.post('/register', authLimiter, validateSchema(registerSchema), authController.register);

// 2. ROTA DE LOGIN
router.post('/login', authLimiter, validateSchema(loginSchema), authController.login);

// 3. ROTA: Pedir código de recuperação de password por email
router.post('/forgot-password', authLimiter, validateSchema(forgotPasswordSchema), authController.forgotPassword);

// 4. ROTA: Redefinir a password antiga trocando pela nova usando o código enviado
router.post('/reset-password', authLimiter, validateSchema(resetPasswordSchema), authController.resetPassword);

// 5. ROTA: Mudar a password obrigatória após reset do Admin
router.post('/forcar-mudanca-password', authLimiter, validateSchema(forcarMudancaPasswordSchema), authController.forcarMudancaPassword);

// 6. ROTA: Verificar código de login 2FA
router.post('/verify-login', authLimiter, authController.verifyLogin);

// 7. ROTA: Logout (Limpar Cookie)
router.post('/logout', authController.logout);

module.exports = router;