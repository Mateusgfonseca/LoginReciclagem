const agendamentoService = require('../services/AgendamentoService');

class AgendamentoController {
  async criar(req, res) {
    try {
      const agendamento = await agendamentoService.criar(req.body);

      res.status(201).json({
        sucesso: true,
        mensagem: 'Agendamento criado com sucesso',
        dados: agendamento
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async listar(req, res) {
    try {
      const agendamentos = await agendamentoService.listar(req.query);

      res.json({
        sucesso: true,
        dados: agendamentos
      });
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {
      const agendamento = await agendamentoService.buscarPorId(req.params.id);

      res.json({
        sucesso: true,
        dados: agendamento
      });
    } catch (error) {
      const status = error.message === 'Agendamento não encontrado' ? 404 : 400;
      res.status(status).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, justificativa } = req.body;

      const agendamento = await agendamentoService.atualizarStatus(id, status, justificativa);

      res.json({
        sucesso: true,
        mensagem: 'Status atualizado com sucesso',
        dados: agendamento
      });
    } catch (error) {
      const status = error.message === 'Agendamento não encontrado' ? 404 : 400;
      res.status(status).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }
}

module.exports = new AgendamentoController(); 