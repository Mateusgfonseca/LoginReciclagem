const AuthService = require('../services/AuthService');

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const resultado = await AuthService.login(email, senha);

      res.status(200).json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso',
        dados: resultado
      });
    } catch (error) {
      res.status(400).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async verificar(req, res) {
    try {
      // O middleware já verificou o token e adicionou os dados do usuário
      res.status(200).json({
        sucesso: true,
        dados: {
          usuario: req.usuario,
          tempoRestante: req.tempoRestante,
          proximoVencimento: req.proximoVencimento
        }
      });
    } catch (error) {
      res.status(401).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }

  async renovar(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          sucesso: false,
          mensagem: 'Token não fornecido'
        });
      }

      const tokenAtual = authHeader.substring(7);
      const resultado = await AuthService.renovarToken(tokenAtual);

      res.status(200).json({
        sucesso: true,
        mensagem: resultado.renovado ? 'Token renovado com sucesso' : 'Token ainda válido',
        dados: resultado
      });
    } catch (error) {
      res.status(401).json({
        sucesso: false,
        mensagem: error.message
      });
    }
  }
}

module.exports = new AuthController(); 