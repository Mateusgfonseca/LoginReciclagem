const pool = require('../config/database');
const Agendamento = require('../models/Agendamento');

class AgendamentoRepository {
  async criar(dadosAgendamento, tiposMateriais) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Inserir agendamento
      const resultAgendamento = await client.query(
        `INSERT INTO agendamentos 
         (protocolo, nome_completo, email, telefone, endereco_rua, endereco_numero, 
          endereco_bairro, endereco_cidade, data_sugerida) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          dadosAgendamento.protocolo,
          dadosAgendamento.nomeCompleto,
          dadosAgendamento.email,
          dadosAgendamento.telefone,
          dadosAgendamento.enderecoRua,
          dadosAgendamento.enderecoNumero,
          dadosAgendamento.enderecoBairro,
          dadosAgendamento.enderecoCidade,
          dadosAgendamento.dataSugerida
        ]
      );

      const agendamento = resultAgendamento.rows[0];

      // Inserir materiais
      for (const tipoMaterialId of tiposMateriais) {
        await client.query(
          'INSERT INTO agendamento_materiais (agendamento_id, tipo_material_id) VALUES ($1, $2)',
          [agendamento.id, tipoMaterialId]
        );
      }

      await client.query('COMMIT');

      return await this.buscarPorId(agendamento.id);

    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Erro ao criar agendamento: ${error.message}`);
    } finally {
      client.release();
    }
  }

  async buscarPorId(id) {
    try {
      // Buscar agendamento
      const agendamentoResult = await pool.query(
        'SELECT * FROM agendamentos WHERE id = $1',
        [id]
      );

      if (agendamentoResult.rows.length === 0) {
        return null;
      }

      const agendamento = agendamentoResult.rows[0];

      // Buscar materiais separadamente
      const materiaisResult = await pool.query(
        `SELECT tm.id, tm.nome 
         FROM tipos_material tm
         INNER JOIN agendamento_materiais am ON tm.id = am.tipo_material_id
         WHERE am.agendamento_id = $1`,
        [id]
      );

      // Adicionar materiais ao agendamento
      agendamento.materiais = materiaisResult.rows;

      return new Agendamento(agendamento);
    } catch (error) {
      throw new Error(`Erro ao buscar agendamento: ${error.message}`);
    }
  }

  async listar(filtros = {}) {
    try {
      let query = `
        SELECT * FROM agendamentos a
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 0;

      if (filtros.status) {
        paramCount++;
        query += ` AND a.status = $${paramCount}`;
        params.push(filtros.status);
      }

      if (filtros.dataInicio) {
        paramCount++;
        query += ` AND a.data_sugerida >= $${paramCount}`;
        params.push(filtros.dataInicio);
      }

      if (filtros.dataFim) {
        paramCount++;
        query += ` AND a.data_sugerida <= $${paramCount}`;
        params.push(filtros.dataFim);
      }

      query += ` ORDER BY a.criado_em DESC`;

      const result = await pool.query(query, params);

      // Para cada agendamento, buscar seus materiais
      const agendamentos = [];
      for (const agendamento of result.rows) {
        const materiaisResult = await pool.query(
          `SELECT tm.id, tm.nome 
           FROM tipos_material tm
           INNER JOIN agendamento_materiais am ON tm.id = am.tipo_material_id
           WHERE am.agendamento_id = $1`,
          [agendamento.id]
        );

        agendamento.materiais = materiaisResult.rows;
        agendamentos.push(new Agendamento(agendamento));
      }

      return agendamentos;

    } catch (error) {
      throw new Error(`Erro ao listar agendamentos: ${error.message}`);
    }
  }

  async atualizarStatus(id, status, justificativa = null) {
    try {
      const result = await pool.query(
        `UPDATE agendamentos 
         SET status = $1, justificativa = $2, atualizado_em = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING *`,
        [status, justificativa, id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return await this.buscarPorId(id);

    } catch (error) {
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
  }
}

module.exports = new AgendamentoRepository(); 