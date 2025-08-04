const pool = require('../config/database');
const TipoMaterial = require('../models/TipoMaterial');

class TipoMaterialRepository {
  async listarAtivos() {
    try {
      const result = await pool.query(
        'SELECT * FROM tipos_material WHERE ativo = true ORDER BY nome'
      );

      return result.rows.map(dados => new TipoMaterial(dados));
    } catch (error) {
      throw new Error(`Erro ao listar tipos de material: ${error.message}`);
    }
  }

  async buscarPorIds(ids) {
    try {
      if (!ids || ids.length === 0) {
        return [];
      }

      const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');

      const result = await pool.query(
        `SELECT * FROM tipos_material WHERE id IN (${placeholders}) AND ativo = true`,
        ids
      );

      return result.rows.map(dados => new TipoMaterial(dados));
    } catch (error) {
      throw new Error(`Erro ao buscar tipos de material: ${error.message}`);
    }
  }
}

module.exports = new TipoMaterialRepository(); 