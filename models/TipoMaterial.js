class TipoMaterial {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.ativo = data.ativo;
    this.criadoEm = data.criado_em;
  }
}

module.exports = TipoMaterial; 