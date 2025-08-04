class Usuario {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.senha = data.senha;
    this.nome = data.nome;
    this.ativo = data.ativo;
    this.criadoEm = data.criado_em;
    this.atualizadoEm = data.atualizado_em;
  }

  // Retorna dados do usuário sem a senha
  toJSON() {
    const { senha, ...dadosPublicos } = this;
    return dadosPublicos;
  }
}

module.exports = Usuario; 