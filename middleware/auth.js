const AuthService = require('../services/AuthService');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token de acesso não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    const verificacao = await AuthService.verificarToken(token);

    // Adicionar informações do usuário à requisição
    req.usuario = verificacao.usuario;
    req.tempoRestante = verificacao.tempoRestante;
    req.proximoVencimento = verificacao.proximoVencimento;

    // Se o token está próximo do vencimento, incluir header para o frontend saber
    if (verificacao.proximoVencimento) {
      res.set('X-Token-Expiring', 'true');
      res.set('X-Time-Remaining', verificacao.tempoRestante.toString());
    }

    next();
  } catch (error) {
    let status = 401;
    let mensagem = 'Token inválido';

    if (error.message === 'Token expirado') {
      status = 401;
      mensagem = 'Token expirado. Faça login novamente.';
    } else if (error.message === 'Token não fornecido') {
      status = 401;
      mensagem = 'Token de acesso obrigatório';
    }

    return res.status(status).json({
      sucesso: false,
      mensagem,
      codigo: error.message === 'Token expirado' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
    });
  }
};

module.exports = auth; 