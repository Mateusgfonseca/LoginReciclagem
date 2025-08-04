const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

// Rotas públicas
router.post('/login', AuthController.login);

// Rotas protegidas
router.get('/verificar', auth, AuthController.verificar);
router.post('/renovar', AuthController.renovar); // Não usa middleware pois vai verificar internamente

module.exports = router; 