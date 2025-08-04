const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/UsuarioRepository');

// Secret dinâmico que muda a cada reinício do servidor
const SERVER_SECRET = process.env.JWT_SECRET + '_' + Date.now() + '_' + Math.random();

class AuthService {
  async login(email, senha) {
    if (!email || !senha) {
      throw new Error('E-mail e senha são obrigatórios');
    }

    const usuario = await usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new Error('Credenciais inválidas');
    }

    let senhaValida;
    if (usuario.senha.startsWith('$2a$') || usuario.senha.startsWith('$2b$')) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      senhaValida = usuario.senha === senha;
    }

    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token com expiração de 1 hora
    const token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        iat: Math.floor(Date.now() / 1000)
      },
      SERVER_SECRET,
      {
        expiresIn: '1h',
        issuer: 'ecoleta-app',
        audience: 'ecoleta-users'
      }
    );

    return {
      token,
      usuario: usuario.toJSON(),
      expiresIn: 3600 // 1 hora em segundos
    };
  }

  async verificarToken(token) {
    if (!token) {
      throw new Error('Token não fornecido');
    }

    try {
      const decoded = jwt.verify(token, SERVER_SECRET, {
        issuer: 'ecoleta-app',
        audience: 'ecoleta-users'
      });

      const usuario = await usuarioRepository.buscarPorId(decoded.userId);
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o token não está muito próximo do vencimento (menos de 5 minutos)
      const tempoRestante = decoded.exp - Math.floor(Date.now() / 1000);

      return {
        usuario: usuario.toJSON(),
        tempoRestante,
        proximoVencimento: tempoRestante < 300 // menos de 5 minutos
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else {
        throw new Error('Erro na verificação do token');
      }
    }
  }

  // Método para renovar token se estiver próximo do vencimento
  async renovarToken(tokenAntigo) {
    try {
      const verificacao = await this.verificarToken(tokenAntigo);

      if (verificacao.proximoVencimento) {
        // Gerar novo token
        const novoToken = jwt.sign(
          {
            userId: verificacao.usuario.id,
            email: verificacao.usuario.email,
            iat: Math.floor(Date.now() / 1000)
          },
          SERVER_SECRET,
          {
            expiresIn: '1h',
            issuer: 'ecoleta-app',
            audience: 'ecoleta-users'
          }
        );

        return {
          token: novoToken,
          renovado: true,
          expiresIn: 3600
        };
      }

      return {
        token: tokenAntigo,
        renovado: false,
        tempoRestante: verificacao.tempoRestante
      };
    } catch (error) {
      throw new Error('Não foi possível renovar o token');
    }
  }
}

module.exports = new AuthService(); 