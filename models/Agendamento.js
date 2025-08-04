class Agendamento {
  constructor(data) {
    this.id = data.id;
    this.protocolo = data.protocolo;
    this.nomeCompleto = data.nomeCompleto || data.nome_completo;
    this.email = data.email;
    this.telefone = data.telefone;
    this.enderecoRua = data.enderecoRua || data.endereco_rua;
    this.enderecoNumero = data.enderecoNumero || data.endereco_numero;
    this.enderecoBairro = data.enderecoBairro || data.endereco_bairro;
    this.enderecoCidade = data.enderecoCidade || data.endereco_cidade;
    this.dataSugerida = data.dataSugerida || data.data_sugerida;
    this.status = data.status;
    this.justificativa = data.justificativa;
    this.criadoEm = data.criadoEm || data.criado_em;
    this.atualizadoEm = data.atualizadoEm || data.atualizado_em;
    this.materiais = data.materiais || [];
  }

  get enderecoCompleto() {
    return `${this.enderecoRua}, ${this.enderecoNumero} - ${this.enderecoBairro}, ${this.enderecoCidade}`;
  }

  static gerarProtocolo() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `COL${timestamp.slice(-6)}${random}`;
  }
}

module.exports = Agendamento; 