const express = require('express');
const { verificarAdmin } = require('../../middlewares/authMiddleware');
const adminController = require('../../controllers/auth/adminController');
const router = express.Router();

// 1. Ver todos os utilizadores (Protegido por verificarAdmin)
router.get('/users', verificarAdmin, adminController.getUsers);

// 2. Mudar a permissão de um utilizador (Dar ou tirar Admin)
router.put('/users/:id/role', verificarAdmin, adminController.updateUserRole);

// 3. Apagar um utilizador
router.delete('/users/:id', verificarAdmin, adminController.deleteUser);

// 4. Editar o email e/ou repor a password de um utilizador
router.put('/users/:id/editar', verificarAdmin, adminController.editUser);

module.exports = router;