const pool = require('../config/database');
const Usuario = require('../models/Usuario');

class UsuarioRepository {
  async buscarPorEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM usuarios WHERE email = $1 AND ativo = true',
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Usuario(result.rows[0]);
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  async buscarPorId(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM usuarios WHERE id = $1 AND ativo = true',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Usuario(result.rows[0]);
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }
}

module.exports = new UsuarioRepository(); 