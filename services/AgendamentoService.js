const agendamentoRepository = require('../repositories/AgendamentoRepository');
const tipoMaterialRepository = require('../repositories/TipoMaterialRepository');
const Agendamento = require('../models/Agendamento');

class AgendamentoService {
  async criar(dados) {
    // Validações básicas
    this.validarDadosObrigatorios(dados);
    this.validarTelefone(dados.telefone);
    this.validarEmail(dados.email);
    this.validarEndereco(dados);
    this.validarData(dados.dataSugerida);

    await this.validarMateriais(dados.tiposMateriais);

    // Criar agendamento
    const novoAgendamento = new Agendamento({
      protocolo: Agendamento.gerarProtocolo(),
      nomeCompleto: dados.nomeCompleto.trim(),
      email: dados.email.trim().toLowerCase(),
      telefone: dados.telefone.replace(/\D/g, ''),
      enderecoRua: dados.enderecoRua.trim(),
      enderecoNumero: dados.enderecoNumero.trim(),
      enderecoBairro: dados.enderecoBairro.trim(),
      enderecoCidade: dados.enderecoCidade.trim(),
      dataSugerida: dados.dataSugerida,
      status: 'Pendente'
    });

    return await agendamentoRepository.criar(novoAgendamento, dados.tiposMateriais);
  }

  validarDadosObrigatorios(dados) {
    const camposObrigatorios = [
      { campo: 'nomeCompleto', nome: 'Nome completo', minimo: 3 },
      { campo: 'email', nome: 'E-mail' },
      { campo: 'telefone', nome: 'Telefone' },
      { campo: 'enderecoRua', nome: 'Rua/Avenida', minimo: 2 },
      { campo: 'enderecoNumero', nome: 'Número' },
      { campo: 'enderecoBairro', nome: 'Bairro', minimo: 2 },
      { campo: 'enderecoCidade', nome: 'Cidade', minimo: 2 },
      { campo: 'dataSugerida', nome: 'Data sugerida' }
    ];

    for (const { campo, nome, minimo } of camposObrigatorios) {
      if (!dados[campo] || dados[campo].toString().trim().length === 0) {
        throw new Error(`${nome} é obrigatório`);
      }

      if (minimo && dados[campo].toString().trim().length < minimo) {
        throw new Error(`${nome} deve ter pelo menos ${minimo} caracteres`);
      }

      // Validar se campos de texto não contêm apenas números
      if (['nomeCompleto', 'enderecoRua', 'enderecoBairro', 'enderecoCidade'].includes(campo)) {
        if (/^\d+$/.test(dados[campo].toString().trim())) {
          throw new Error(`${nome} não pode conter apenas números`);
        }
      }
    }
  }

  validarTelefone(telefone) {
    if (!telefone) {
      throw new Error('Telefone é obrigatório');
    }

    const numeroLimpo = telefone.replace(/\D/g, '');

    if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
      throw new Error('Telefone deve ter 10 ou 11 dígitos');
    }

    // Validar se não são todos números iguais
    if (/^(\d)\1+$/.test(numeroLimpo)) {
      throw new Error('Telefone inválido (números repetidos)');
    }

    // Validar padrões suspeitos
    const padroesSuspeitos = [
      '1111111111', '2222222222', '3333333333', '4444444444', '5555555555',
      '6666666666', '7777777777', '8888888888', '9999999999', '0000000000',
      '1234567890', '0987654321', '1111111', '2222222', '3333333'
    ];

    if (padroesSuspeitos.includes(numeroLimpo)) {
      throw new Error('Telefone inválido (sequência suspeita)');
    }
  }

  validarEmail(email) {
    if (!email || !email.trim()) {
      throw new Error('E-mail é obrigatório');
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email.trim())) {
      throw new Error('E-mail inválido. Use o formato: exemplo@email.com');
    }
  }

  validarEndereco(dados) {
    // Validar número da casa
    const numero = dados.enderecoNumero.trim();
    const regex = /^(\d+[a-zA-Z]?|[sS]\/[nN])$/;

    if (!regex.test(numero)) {
      throw new Error('Número inválido. Use apenas números (ex: 123, 123A) ou S/N');
    }
  }

  validarData(dataSugerida) {
    if (!dataSugerida) {
      throw new Error('Data sugerida é obrigatória');
    }

    const data = new Date(dataSugerida);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (isNaN(data.getTime())) {
      throw new Error('Data inválida');
    }

    if (data <= hoje) {
      throw new Error('Data deve ser futura');
    }

    // Calcular data mínima (2 dias úteis)
    let diasAdicionados = 0;
    let dataMinima = new Date(hoje);

    // Começar a contar a partir de amanhã
    dataMinima.setDate(dataMinima.getDate() + 1);

    while (diasAdicionados < 2) {
      // Se a data atual não for sábado (6) nem domingo (0), contar como dia útil
      if (dataMinima.getDay() !== 0 && dataMinima.getDay() !== 6) {
        diasAdicionados++;
      }

      // Se ainda não chegamos aos 2 dias úteis, avançar mais um dia
      if (diasAdicionados < 2) {
        dataMinima.setDate(dataMinima.getDate() + 1);
      }
    }

    if (data < dataMinima) {
      throw new Error('Data deve ser pelo menos 2 dias úteis a partir de hoje');
    }
  }

  async validarMateriais(tiposMateriais) {
    if (!tiposMateriais || !Array.isArray(tiposMateriais) || tiposMateriais.length === 0) {
      throw new Error('Selecione pelo menos um tipo de material');
    }

    // Verificar se todos os IDs são válidos
    const materiaisValidos = await tipoMaterialRepository.buscarPorIds(tiposMateriais);

    if (materiaisValidos.length !== tiposMateriais.length) {
      throw new Error('Um ou mais tipos de material são inválidos');
    }
  }

  async listar(filtros = {}) {
    return await agendamentoRepository.listar(filtros);
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const agendamento = await agendamentoRepository.buscarPorId(id);

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    return agendamento;
  }

  async atualizarStatus(id, status, justificativa) {
    const agendamento = await this.buscarPorId(id);

    const statusValidos = ['Pendente', 'Agendado', 'Concluído', 'Cancelado'];
    if (!statusValidos.includes(status)) {
      throw new Error('Status inválido');
    }

    // Justificativa é obrigatória para Concluído e Cancelado
    if ((status === 'Concluído' || status === 'Cancelado') && (!justificativa || justificativa.trim().length === 0)) {
      throw new Error('Justificativa é obrigatória para status Concluído ou Cancelado');
    }

    return await agendamentoRepository.atualizarStatus(id, status, justificativa);
  }

  calcularProximoDiaUtil(dataBase, diasUteis) {
    const data = new Date(dataBase);
    let diasAdicionados = 0;

    while (diasAdicionados < diasUteis) {
      data.setDate(data.getDate() + 1);

      // Se não for sábado (6) nem domingo (0), conta como dia útil
      if (data.getDay() !== 0 && data.getDay() !== 6) {
        diasAdicionados++;
      }
    }

    return data;
  }
}

module.exports = new AgendamentoService(); 