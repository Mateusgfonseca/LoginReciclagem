const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/AgendamentoController');
const authMiddleware = require('../middleware/auth');

// Rota pública - criar agendamento
// POST /api/agendamentos
router.post('/', agendamentoController.criar);

// Rotas protegidas (admin)
// GET /api/agendamentos
router.get('/', authMiddleware, agendamentoController.listar);

// GET /api/agendamentos/:id
router.get('/:id', authMiddleware, agendamentoController.buscarPorId);

// PUT /api/agendamentos/:id/status
router.put('/:id/status', authMiddleware, agendamentoController.atualizarStatus);

module.exports = router; 