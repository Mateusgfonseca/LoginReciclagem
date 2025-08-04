const express = require('express');
const router = express.Router();
const materialController = require('../controllers/MaterialController');

// Rota pública - listar tipos de material
// GET /api/materiais
router.get('/', materialController.listar);

module.exports = router; 