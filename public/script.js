// Estado da aplicação
const state = {
  usuario: null,
  token: localStorage.getItem('token'),
  tokenExpiration: localStorage.getItem('tokenExpiration'),
  agendamentos: [],
  agendamentoAtual: null,
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  }
};

// Elementos do DOM
const elements = {
  loading: document.getElementById('loading'),
  telaAgendamento: document.getElementById('telaAgendamento'),
  telaConfirmacao: document.getElementById('telaConfirmacao'),
  telaLogin: document.getElementById('telaLogin'),
  telaAdmin: document.getElementById('telaAdmin'),

  // Formulários
  formAgendamento: document.getElementById('formAgendamento'),
  formLogin: document.getElementById('formLogin'),
  formFiltros: document.getElementById('formFiltros'),
  formStatus: document.getElementById('formStatus'),

  // Botões
  btnAdmin: document.getElementById('btnAdmin'),
  btnNovoAgendamento: document.getElementById('btnNovoAgendamento'),
  btnVoltarLogin: document.getElementById('btnVoltarLogin'),
  btnLogoutHeader: document.getElementById('btnLogoutHeader'),
  btnLimparFiltros: document.getElementById('btnLimparFiltros'),
  btnDownloadAgendamento: document.getElementById('btnDownloadAgendamento'),

  // Paginação
  paginationContainer: document.getElementById('paginationContainer'),
  paginationInfo: document.getElementById('paginationInfo'),
  paginationPages: document.getElementById('paginationPages'),
  btnPrimeiraPagina: document.getElementById('btnPrimeiraPagina'),
  btnPaginaAnterior: document.getElementById('btnPaginaAnterior'),
  btnProximaPagina: document.getElementById('btnProximaPagina'),
  btnUltimaPagina: document.getElementById('btnUltimaPagina'),
  itensPorPagina: document.getElementById('itensPorPagina'),

  // Containers
  tiposMateriais: document.getElementById('tiposMateriais'),
  listaAgendamentos: document.getElementById('listaAgendamentos'),
  toastContainer: document.getElementById('toastContainer'),

  // Modais
  modalDetalhes: document.getElementById('modalDetalhes'),
  modalStatus: document.getElementById('modalStatus'),
  detalhesConteudo: document.getElementById('detalhesConteudo'),

  // Campos específicos
  telefone: document.getElementById('telefone'),
  dataSugerida: document.getElementById('dataSugerida'),
  novoStatus: document.getElementById('novoStatus'),
  grupoJustificativa: document.getElementById('grupoJustificativa')
};

// Utilitários
const utils = {
  formatarTelefone(valor) {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .substring(0, 15);
  },

  formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
  },

  construirEnderecoCompleto(agendamento) {
    // Tentar diferentes formatos de propriedades
    const rua = agendamento.enderecoRua || agendamento.endereco_rua || '';
    const numero = agendamento.enderecoNumero || agendamento.endereco_numero || '';
    const bairro = agendamento.enderecoBairro || agendamento.endereco_bairro || '';
    const cidade = agendamento.enderecoCidade || agendamento.endereco_cidade || '';

    if (!rua || !numero || !bairro || !cidade) {
      return 'Endereço não disponível';
    }

    return `${rua}, ${numero} - ${bairro}, ${cidade}`;
  },

  calcularDataMinima() {
    const hoje = new Date();
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

    return dataMinima.toISOString().split('T')[0];
  },

  limparErros() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
    });
  },

  mostrarErro(campo, mensagem) {
    const errorElement = document.querySelector(`#${campo} + .error-message`) ||
      document.querySelector(`[name="${campo}"] + .error-message`);
    if (errorElement) {
      errorElement.textContent = mensagem;
    }
  },

  // Validações
  validarEmail(email) {
    if (!email || email.trim().length === 0) {
      return { valido: false, mensagem: 'E-mail é obrigatório' };
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email.trim())) {
      return { valido: false, mensagem: 'E-mail inválido. Use o formato: exemplo@email.com' };
    }
    return { valido: true };
  },

  validarTelefone(telefone) {
    if (!telefone) {
      return { valido: false, mensagem: 'Telefone é obrigatório' };
    }

    // Remover formatação para validar
    const numeroLimpo = telefone.replace(/\D/g, '');

    if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
      return { valido: false, mensagem: 'Telefone deve ter 10 ou 11 dígitos' };
    }

    // Validar se não são todos números iguais
    if (/^(\d)\1+$/.test(numeroLimpo)) {
      return { valido: false, mensagem: 'Telefone inválido (números repetidos)' };
    }

    // Validar padrões suspeitos
    const padroesSuspeitos = [
      '1111111111', '2222222222', '3333333333', '4444444444', '5555555555',
      '6666666666', '7777777777', '8888888888', '9999999999', '0000000000',
      '1234567890', '0987654321', '1111111', '2222222', '3333333'
    ];

    if (padroesSuspeitos.includes(numeroLimpo)) {
      return { valido: false, mensagem: 'Telefone inválido (sequência suspeita)' };
    }

    return { valido: true };
  },

  validarNumero(numero) {
    if (!numero) {
      return { valido: false, mensagem: 'Número é obrigatório' };
    }

    // Permitir apenas números, 's/n' ou 'S/N'
    const regex = /^(\d+[a-zA-Z]?|[sS]\/[nN])$/;
    if (!regex.test(numero.trim())) {
      return { valido: false, mensagem: 'Número inválido. Use apenas números (ex: 123, 123A) ou S/N' };
    }

    return { valido: true };
  },

  validarCampoTexto(valor, nomeCampo, tamanhoMinimo = 2) {
    if (!valor || valor.trim().length === 0) {
      return { valido: false, mensagem: `${nomeCampo} é obrigatório` };
    }

    if (valor.trim().length < tamanhoMinimo) {
      return { valido: false, mensagem: `${nomeCampo} deve ter pelo menos ${tamanhoMinimo} caracteres` };
    }

    // Validar se não contém apenas números
    if (/^\d+$/.test(valor.trim())) {
      return { valido: false, mensagem: `${nomeCampo} não pode conter apenas números` };
    }

    return { valido: true };
  },

  validarData(data) {
    if (!data) {
      return { valido: false, mensagem: 'Data é obrigatória' };
    }

    const dataEscolhida = new Date(data);
    const dataMinima = new Date(this.calcularDataMinima());

    if (dataEscolhida < dataMinima) {
      return { valido: false, mensagem: 'Data deve ser pelo menos 2 dias úteis a partir de hoje' };
    }

    return { valido: true };
  },

  validarMateriais(materiais) {
    if (!materiais || materiais.length === 0) {
      return { valido: false, mensagem: 'Selecione pelo menos um tipo de material' };
    }
    return { valido: true };
  },

  validarFormulario(dados) {
    const erros = [];

    // Validar nome completo
    const validacaoNome = this.validarCampoTexto(dados.nomeCompleto, 'Nome completo', 3);
    if (!validacaoNome.valido) {
      erros.push(validacaoNome.mensagem);
    }

    // Validar email (agora obrigatório)
    const validacaoEmail = this.validarEmail(dados.email);
    if (!validacaoEmail.valido) {
      erros.push(validacaoEmail.mensagem);
    }

    // Validar telefone
    const validacaoTelefone = this.validarTelefone(dados.telefone);
    if (!validacaoTelefone.valido) {
      erros.push(validacaoTelefone.mensagem);
    }

    // Validar endereço
    const validacaoRua = this.validarCampoTexto(dados.enderecoRua, 'Rua/Avenida');
    if (!validacaoRua.valido) {
      erros.push(validacaoRua.mensagem);
    }

    const validacaoNumero = this.validarNumero(dados.enderecoNumero);
    if (!validacaoNumero.valido) {
      erros.push(validacaoNumero.mensagem);
    }

    const validacaoBairro = this.validarCampoTexto(dados.enderecoBairro, 'Bairro');
    if (!validacaoBairro.valido) {
      erros.push(validacaoBairro.mensagem);
    }

    const validacaoCidade = this.validarCampoTexto(dados.enderecoCidade, 'Cidade');
    if (!validacaoCidade.valido) {
      erros.push(validacaoCidade.mensagem);
    }

    // Validar data
    const validacaoData = this.validarData(dados.dataSugerida);
    if (!validacaoData.valido) {
      erros.push(validacaoData.mensagem);
    }

    // Validar materiais
    const validacaoMateriais = this.validarMateriais(dados.tiposMateriais);
    if (!validacaoMateriais.valido) {
      erros.push(validacaoMateriais.mensagem);
    }

    return erros;
  }
};

// API Client
const api = {
  baseURL: '/api',

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (state.token) {
      // Verificar se o token expirou
      if (this.tokenExpirado()) {
        await this.limparSessao();
        ui.mostrarToast('Sessão expirada. Faça login novamente.', 'warning');
        ui.mostrarTela('telaAgendamento');
        throw new Error('Token expirado');
      }

      config.headers.Authorization = `Bearer ${state.token}`;
    }

    try {
      ui.mostrarLoading(true);
      const response = await fetch(url, config);

      // Verificar se o token está próximo do vencimento
      if (response.headers.get('X-Token-Expiring') === 'true') {
        await this.tentarRenovarToken();
      }

      const data = await response.json();

      if (!response.ok) {
        // Se receber erro de token expirado, limpar sessão
        if (data.codigo === 'TOKEN_EXPIRED') {
          await this.limparSessao();
          ui.mostrarToast('Sessão expirada. Faça login novamente.', 'warning');
          ui.mostrarTela('telaAgendamento');
          throw new Error('Sessão expirada');
        }
        throw new Error(data.mensagem || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      // Não mostrar no console erros de validação (400)
      if (!error.message.includes('deve ser pelo menos') &&
        !error.message.includes('é obrigatório') &&
        !error.message.includes('inválido') &&
        !error.message.includes('Credenciais inválidas') &&
        !error.message.includes('expirado')) {
        console.error('Erro na API:', error);
      }
      throw error;
    } finally {
      ui.mostrarLoading(false);
    }
  },

  tokenExpirado() {
    if (!state.tokenExpiration) return false;
    const expiracao = parseInt(state.tokenExpiration);
    const agora = Date.now();
    return agora >= expiracao;
  },

  async tentarRenovarToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/renovar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.sucesso && data.dados.renovado) {
          // Atualizar token e expiração
          state.token = data.dados.token;
          const novaExpiracao = Date.now() + (data.dados.expiresIn * 1000);
          state.tokenExpiration = novaExpiracao.toString();

          localStorage.setItem('token', state.token);
          localStorage.setItem('tokenExpiration', state.tokenExpiration);

          ui.mostrarToast('Sessão renovada automaticamente', 'success');
        }
      }
    } catch (error) {
      console.warn('Não foi possível renovar o token:', error);
    }
  },

  async limparSessao() {
    state.token = null;
    state.tokenExpiration = null;
    state.usuario = null;
    state.agendamentos = [];

    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
  },

  // Endpoints de materiais
  async listarMateriais() {
    return await this.request('/materiais');
  },

  // Endpoints de agendamentos
  async criarAgendamento(dados) {
    return await this.request('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },

  async listarAgendamentos(filtros = {}) {
    const params = new URLSearchParams(filtros);
    return await this.request(`/agendamentos?${params}`);
  },

  async buscarAgendamento(id) {
    return await this.request(`/agendamentos/${id}`);
  },

  async atualizarStatus(id, status, justificativa) {
    return await this.request(`/agendamentos/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, justificativa })
    });
  },

  // Endpoints de autenticação
  async login(email, senha) {
    return await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
  },

  async verificarToken() {
    return await this.request('/auth/verificar');
  }
};

// UI Manager
const ui = {
  mostrarTela(nomeTela) {
    document.querySelectorAll('.tela').forEach(tela => {
      tela.classList.remove('ativa');
    });
    elements[nomeTela].classList.add('ativa');

    // Controlar visibilidade dos botões no header
    const btnAdmin = document.getElementById('btnAdmin');
    const btnLogoutHeader = document.getElementById('btnLogoutHeader');

    if (nomeTela === 'telaAdmin') {
      btnAdmin.style.display = 'none';
      btnLogoutHeader.style.display = 'inline-flex';
    } else {
      btnAdmin.style.display = 'inline-flex';
      btnLogoutHeader.style.display = 'none';
    }
  },

  mostrarLoading(mostrar) {
    elements.loading.classList.toggle('hidden', !mostrar);
  },

  mostrarToast(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;

    toast.innerHTML = `
      <div class="toast-icon"></div>
      <div class="toast-message">${mensagem}</div>
      <button class="toast-close" type="button">&times;</button>
    `;

    elements.toastContainer.appendChild(toast);

    // Função para fechar com animação
    const fecharToast = () => {
      toast.classList.add('closing');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300); // Tempo da animação
    };

    // Adicionar evento de clique no botão fechar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', fecharToast);

    // Auto remover após 4 segundos
    setTimeout(() => {
      if (toast.parentNode && !toast.classList.contains('closing')) {
        fecharToast();
      }
    }, 4000);
  },

  // Paginação
  renderizarPaginacao() {
    const { currentPage, totalPages, totalItems, itemsPerPage } = state.pagination;

    // Mostrar/esconder container de paginação
    if (totalItems === 0) {
      elements.paginationContainer.style.display = 'none';
      return;
    } else {
      elements.paginationContainer.style.display = 'flex';
    }

    // Atualizar informações
    const inicio = ((currentPage - 1) * itemsPerPage) + 1;
    const fim = Math.min(currentPage * itemsPerPage, totalItems);
    elements.paginationInfo.textContent = `Mostrando ${inicio}-${fim} de ${totalItems} agendamentos`;

    // Controlar visibilidade e estado dos botões de navegação
    if (totalPages <= 1) {
      // Se só tem 1 página, esconder todos os controles de navegação
      elements.btnPrimeiraPagina.style.display = 'none';
      elements.btnPaginaAnterior.style.display = 'none';
      elements.btnProximaPagina.style.display = 'none';
      elements.btnUltimaPagina.style.display = 'none';
      elements.paginationPages.style.display = 'none';
    } else {
      // Mostrar todos os controles
      elements.paginationPages.style.display = 'flex';

      // Primeira página e Anterior
      if (currentPage === 1) {
        elements.btnPrimeiraPagina.style.display = 'none';
        elements.btnPaginaAnterior.style.display = 'none';
      } else {
        elements.btnPrimeiraPagina.style.display = 'inline-block';
        elements.btnPaginaAnterior.style.display = 'inline-block';
        elements.btnPrimeiraPagina.disabled = false;
        elements.btnPaginaAnterior.disabled = false;
      }

      // Última página e Próxima
      if (currentPage === totalPages) {
        elements.btnProximaPagina.style.display = 'none';
        elements.btnUltimaPagina.style.display = 'none';
      } else {
        elements.btnProximaPagina.style.display = 'inline-block';
        elements.btnUltimaPagina.style.display = 'inline-block';
        elements.btnProximaPagina.disabled = false;
        elements.btnUltimaPagina.disabled = false;
      }
    }

    // Renderizar páginas
    this.renderizarPaginas();
  },

  renderizarPaginas() {
    const { currentPage, totalPages } = state.pagination;
    elements.paginationPages.innerHTML = '';

    if (totalPages <= 1) return;

    // Calcular quais páginas mostrar
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Ajustar para sempre mostrar 5 páginas quando possível
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 4);
      }
    }

    // Primeira página + ... se necessário
    if (startPage > 1) {
      this.criarBotaoPagina(1);
      if (startPage > 2) {
        elements.paginationPages.appendChild(document.createTextNode('...'));
      }
    }

    // Páginas do meio
    for (let i = startPage; i <= endPage; i++) {
      this.criarBotaoPagina(i);
    }

    // ... + última página se necessário
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        elements.paginationPages.appendChild(document.createTextNode('...'));
      }
      this.criarBotaoPagina(totalPages);
    }
  },

  criarBotaoPagina(pageNum) {
    const button = document.createElement('button');
    button.className = `pagination-page ${pageNum === state.pagination.currentPage ? 'active' : ''}`;
    button.textContent = pageNum;
    button.addEventListener('click', () => handlers.irParaPagina(pageNum));
    elements.paginationPages.appendChild(button);
  },

  mostrarModal(nomeModal) {
    elements[nomeModal].classList.add('ativo');
  },

  fecharModal(nomeModal) {
    elements[nomeModal].classList.remove('ativo');
  },

  limparFormulario(form) {
    form.reset();
    utils.limparErros();
  },

  preencherConfirmacao(agendamento) {
    // Salvar dados do agendamento atual para download
    state.agendamentoAtual = agendamento;

    document.getElementById('protocoloNumero').textContent = agendamento.protocolo;
    document.getElementById('confNome').textContent = agendamento.nomeCompleto;
    document.getElementById('confEmail').textContent = agendamento.email;
    document.getElementById('confTelefone').textContent = agendamento.telefone;
    document.getElementById('confEndereco').textContent = utils.construirEnderecoCompleto(agendamento);
    document.getElementById('confData').textContent = utils.formatarData(agendamento.dataSugerida);
    document.getElementById('confMateriais').textContent = agendamento.materiais.map(m => m.nome).join(', ');
  },

  downloadComprovante() {
    if (!state.agendamentoAtual) {
      ui.mostrarToast('Dados do agendamento não encontrados', 'error');
      return;
    }

    const agendamento = state.agendamentoAtual;
    const conteudo = `
COMPROVANTE DE AGENDAMENTO DE COLETA SELETIVA
=============================================

Protocolo: ${agendamento.protocolo}
Data de emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}

DADOS DO SOLICITANTE:
• Nome Completo: ${agendamento.nomeCompleto}
• Telefone: ${agendamento.telefone}
• E-mail: ${agendamento.email || 'Não informado'}

ENDEREÇO PARA COLETA:
• ${utils.construirEnderecoCompleto(agendamento)}

DETALHES DO AGENDAMENTO:
• Data Sugerida: ${utils.formatarData(agendamento.dataSugerida)}
• Status: ${agendamento.status || 'Pendente'}
• Data de Criação: ${utils.formatarData(agendamento.criadoEm)}

MATERIAIS PARA COLETA:
${agendamento.materiais.map(m => `• ${m.nome}`).join('\n')}

INSTRUÇÕES:
- Mantenha este comprovante até a conclusão da coleta
- Em caso de dúvidas, entre em contato informando o protocolo
- A coleta será realizada conforme disponibilidade da equipe

=============================================
Sistema de Agendamento de Coleta Seletiva
    `.trim();

    // Criar e baixar arquivo
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Comprovante_Agendamento_${agendamento.protocolo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    ui.mostrarToast('Comprovante baixado com sucesso!');
  },

  renderizarMateriais(materiais) {
    elements.tiposMateriais.innerHTML = materiais.map(material => `
      <label class="checkbox-item" for="material_${material.id}">
        <input type="checkbox" id="material_${material.id}" name="tiposMateriais" value="${material.id}">
        <div class="checkbox-content">
          <h4>${material.nome}</h4>
          <p>${material.descricao}</p>
        </div>
      </label>
    `).join('');
  },

  renderizarAgendamentos(agendamentos) {
    // Atualizar estado da paginação
    state.pagination.totalItems = agendamentos.length;
    state.pagination.totalPages = Math.ceil(agendamentos.length / state.pagination.itemsPerPage);

    if (!agendamentos || agendamentos.length === 0) {
      elements.listaAgendamentos.innerHTML = '<p class="texto-vazio">Nenhum agendamento encontrado.</p>';
      elements.paginationContainer.style.display = 'none';
      return;
    }

    // Aplicar paginação
    const startIndex = (state.pagination.currentPage - 1) * state.pagination.itemsPerPage;
    const endIndex = startIndex + state.pagination.itemsPerPage;
    const agendamentosPaginados = agendamentos.slice(startIndex, endIndex);

    const html = agendamentosPaginados.map(agendamento => `
      <div class="agendamento-item">
        <div class="agendamento-header">
          <div class="agendamento-info">
            <h4>Protocolo: ${agendamento.protocolo}</h4>
            <strong>${agendamento.nomeCompleto}</strong>
          </div>
          <span class="status-badge status-${agendamento.status.toLowerCase().replace('í', 'i').replace('ã', 'a')}">${agendamento.status}</span>
        </div>
        <div class="agendamento-meta">
          <p><strong>Data:</strong> ${utils.formatarData(agendamento.dataSugerida)}</p>
          <p><strong>Telefone:</strong> ${agendamento.telefone}</p>
          <p><strong>Endereço:</strong> ${utils.construirEnderecoCompleto(agendamento)}</p>
          <p><strong>Materiais:</strong> ${agendamento.materiais.map(m => m.nome).join(', ')}</p>
        </div>
        <div class="agendamento-actions">
          <button data-action="verDetalhes" data-id="${agendamento.id}" class="btn-primary btn-small">Ver Detalhes</button>
          <button data-action="abrirModalStatus" data-id="${agendamento.id}" class="btn-secondary btn-small">Atualizar Status</button>
        </div>
      </div>
    `).join('');

    elements.listaAgendamentos.innerHTML = html;

    // Adicionar event listeners para botões de ação dos agendamentos
    elements.listaAgendamentos.querySelectorAll('[data-action]').forEach(button => {
      const action = button.dataset.action;
      const id = parseInt(button.dataset.id);

      button.addEventListener('click', () => {
        if (action === 'verDetalhes') {
          handlers.verDetalhes(id);
        } else if (action === 'abrirModalStatus') {
          handlers.abrirModalStatus(id, button.closest('.agendamento-item').querySelector('.status-badge').textContent);
        }
      });
    });

    this.renderizarPaginacao();
  },

  renderizarDetalhes(agendamento) {
    elements.detalhesConteudo.innerHTML = `
      <div class="detalhes-agendamento">
        <div class="detalhe-item">
          <strong>Protocolo:</strong> ${agendamento.protocolo}
        </div>
        <div class="detalhe-item">
          <strong>Nome Completo:</strong> ${agendamento.nomeCompleto}
        </div>
        <div class="detalhe-item">
          <strong>E-mail:</strong> ${agendamento.email || 'Não informado'}
        </div>
        <div class="detalhe-item">
          <strong>Telefone:</strong> ${agendamento.telefone}
        </div>
        <div class="detalhe-item">
          <strong>Endereço:</strong> ${utils.construirEnderecoCompleto(agendamento)}
        </div>
        <div class="detalhe-item">
          <strong>Data Sugerida:</strong> ${utils.formatarData(agendamento.dataSugerida)}
        </div>
        <div class="detalhe-item">
          <strong>Status:</strong> 
          <span class="status-badge status-${agendamento.status.toLowerCase().replace('ê', 'e').replace('ã', 'a')}">
            ${agendamento.status}
          </span>
        </div>
        <div class="detalhe-item">
          <strong>Materiais:</strong>
          <ul>
            ${agendamento.materiais.map(m => `<li>${m.nome}</li>`).join('')}
          </ul>
        </div>
        ${agendamento.justificativa ? `
        <div class="detalhe-item">
          <strong>Justificativa:</strong> ${agendamento.justificativa}
        </div>
        ` : ''}
        <div class="detalhe-item">
          <strong>Criado em:</strong> ${utils.formatarData(agendamento.criadoEm)}
        </div>
        <div class="detalhe-item">
          <strong>Atualizado em:</strong> ${utils.formatarData(agendamento.atualizadoEm)}
        </div>
      </div>
    `;
  }
};

// Event Handlers
const handlers = {
  async inicializar() {
    try {
      // Configurar data mínima
      elements.dataSugerida.min = utils.calcularDataMinima();

      // Carregar materiais
      const response = await api.listarMateriais();
      state.materiais = response.dados;
      ui.renderizarMateriais(state.materiais);

      // Verificar se há token válido e não expirado
      if (state.token && !api.tokenExpirado()) {
        try {
          const response = await api.verificarToken();
          state.usuario = response.dados.usuario;
          ui.mostrarTela('telaAdmin');
          await handlers.carregarAgendamentos();
        } catch (error) {
          // Token inválido ou expirado, limpar sessão
          await api.limparSessao();
          ui.mostrarToast('Sessão expirada. Faça login novamente.', 'warning');
        }
      } else if (state.token) {
        // Token expirado, limpar sessão
        await api.limparSessao();
        ui.mostrarToast('Sessão expirada. Faça login novamente.', 'warning');
      }

    } catch (error) {
      ui.mostrarToast('Erro ao carregar dados iniciais: ' + error.message, 'error');
    }

    // Verificar expiração do token a cada 30 segundos
    setInterval(() => {
      if (state.token && api.tokenExpirado()) {
        api.limparSessao();
        if (document.querySelector('.tela.ativa').id === 'telaAdmin') {
          ui.mostrarToast('Sessão expirada. Redirecionando...', 'warning');
          setTimeout(() => {
            ui.mostrarTela('telaAgendamento');
          }, 2000);
        }
      }
    }, 30000); // 30 segundos
  },

  async agendarColeta(event) {
    event.preventDefault();
    utils.limparErros();

    try {
      const formData = new FormData(elements.formAgendamento);
      const tiposMateriais = Array.from(formData.getAll('tiposMateriais')).map(Number);

      const dados = {
        nomeCompleto: formData.get('nomeCompleto'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        enderecoRua: formData.get('enderecoRua'),
        enderecoNumero: formData.get('enderecoNumero'),
        enderecoBairro: formData.get('enderecoBairro'),
        enderecoCidade: formData.get('enderecoCidade'),
        dataSugerida: formData.get('dataSugerida'),
        tiposMateriais
      };

      // Validar todos os campos
      const erros = utils.validarFormulario(dados);
      if (erros.length > 0) {
        erros.forEach(msg => ui.mostrarToast(msg, 'error'));
        return;
      }

      const response = await api.criarAgendamento(dados);
      ui.preencherConfirmacao(response.dados);
      ui.mostrarTela('telaConfirmacao');
      ui.mostrarToast('Agendamento criado com sucesso!');

    } catch (error) {
      ui.mostrarToast(error.message, 'error');
    }
  },

  async fazerLogin(event) {
    event.preventDefault();
    utils.limparErros();

    try {
      const formData = new FormData(elements.formLogin);
      const email = formData.get('email');
      const senha = formData.get('senha');

      // Validar campos obrigatórios - sempre mostrar popup
      if (!email || email.trim().length === 0) {
        ui.mostrarToast('E-mail é obrigatório', 'error');
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) {
          emailInput.focus();
          emailInput.style.borderColor = '#ef4444';
          setTimeout(() => {
            emailInput.style.borderColor = '';
          }, 3000);
        }
        return;
      }

      if (!senha || senha.trim().length === 0) {
        ui.mostrarToast('Senha é obrigatória', 'error');
        const senhaInput = document.getElementById('loginSenha');
        if (senhaInput) {
          senhaInput.focus();
          senhaInput.style.borderColor = '#ef4444';
          setTimeout(() => {
            senhaInput.style.borderColor = '';
          }, 3000);
        }
        return;
      }

      // Validar formato do email
      const validacaoEmail = utils.validarEmail(email);
      if (!validacaoEmail.valido) {
        ui.mostrarToast(validacaoEmail.mensagem, 'error');
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) {
          emailInput.focus();
          emailInput.style.borderColor = '#ef4444';
          setTimeout(() => {
            emailInput.style.borderColor = '';
          }, 3000);
        }
        return;
      }

      const response = await api.login(email, senha);

      state.token = response.dados.token;
      state.usuario = response.dados.usuario;

      // Calcular expiração (1 hora a partir de agora)
      const expiracao = Date.now() + (response.dados.expiresIn * 1000);
      state.tokenExpiration = expiracao.toString();

      localStorage.setItem('token', state.token);
      localStorage.setItem('tokenExpiration', state.tokenExpiration);

      ui.mostrarTela('telaAdmin');
      ui.mostrarToast('Login realizado com sucesso!');

      await handlers.carregarAgendamentos();

    } catch (error) {
      ui.mostrarToast(error.message, 'error');
    }
  },

  async carregarAgendamentos(filtros = {}) {
    try {
      ui.mostrarLoading(true);
      const response = await api.listarAgendamentos(filtros);

      if (response.sucesso) {
        state.agendamentos = response.dados;
        // Resetar paginação ao carregar novos dados
        state.pagination.currentPage = 1;
        ui.renderizarAgendamentos(state.agendamentos);
      } else {
        ui.mostrarToast('Erro ao carregar agendamentos', 'error');
      }
    } catch (error) {
      ui.mostrarToast('Erro ao carregar agendamentos: ' + error.message, 'error');
    } finally {
      ui.mostrarLoading(false);
    }
  },

  async aplicarFiltros(event) {
    event.preventDefault();

    const formData = new FormData(elements.formFiltros);
    const filtros = {};

    // Incluir status sempre (mesmo vazio para "Todos")
    const status = formData.get('status');
    filtros.status = status;

    if (formData.get('dataInicio')) filtros.dataInicio = formData.get('dataInicio');
    if (formData.get('dataFim')) filtros.dataFim = formData.get('dataFim');

    // Se pelo menos um campo de filtro foi usado, aplicar
    const formularioFoiUsado = status !== null || formData.get('dataInicio') || formData.get('dataFim');
    if (!formularioFoiUsado) {
      ui.mostrarToast('Selecione pelo menos um filtro para aplicar', 'warning');
      return;
    }

    await handlers.carregarAgendamentos(filtros);
    ui.mostrarToast('Filtros aplicados com sucesso!', 'success');
  },

  async atualizarStatus(event) {
    event.preventDefault();
    utils.limparErros();

    try {
      const formData = new FormData(elements.formStatus);
      const id = document.getElementById('statusAgendamentoId').value;
      const status = formData.get('status');
      const justificativa = formData.get('justificativa');

      // Validar status obrigatório
      if (!status || status.trim().length === 0) {
        ui.mostrarToast('Status é obrigatório', 'error');
        return;
      }

      // Validar justificativa para status específicos
      if ((status === 'Concluído' || status === 'Cancelado') && (!justificativa || justificativa.trim().length === 0)) {
        ui.mostrarToast('Justificativa é obrigatória para este status', 'error');
        return;
      }

      await api.atualizarStatus(id, status, justificativa);

      ui.fecharModal('modalStatus');
      ui.mostrarToast('Status atualizado com sucesso!');
      await handlers.carregarAgendamentos();

    } catch (error) {
      ui.mostrarToast(error.message, 'error');
    }
  },

  logout() {
    api.limparSessao();
    ui.limparFormulario(elements.formLogin);
    ui.mostrarTela('telaAgendamento');
    ui.mostrarToast('Logout realizado com sucesso!');
  },

  voltarTelaInicial() {
    ui.limparFormulario(elements.formAgendamento);
    ui.mostrarTela('telaAgendamento');
  },

  limparFiltros() {
    ui.limparFormulario(elements.formFiltros);
    handlers.carregarAgendamentos();
    ui.mostrarToast('Filtros removidos', 'success');
  },

  irParaPagina(page) {
    if (page >= 1 && page <= state.pagination.totalPages) {
      state.pagination.currentPage = page;
      ui.renderizarAgendamentos(state.agendamentos);
    }
  },

  alterarItensPorPagina() {
    state.pagination.itemsPerPage = parseInt(elements.itensPorPagina.value);
    state.pagination.currentPage = 1; // Voltar para primeira página
    state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
    ui.renderizarAgendamentos(state.agendamentos);
  },

  async verDetalhes(id) {
    try {
      const response = await api.buscarAgendamento(id);
      ui.renderizarDetalhes(response.dados);
      ui.mostrarModal('modalDetalhes');
    } catch (error) {
      ui.mostrarToast('Erro ao carregar detalhes: ' + error.message, 'error');
    }
  },

  abrirModalStatus(id, statusAtual) {
    document.getElementById('statusAgendamentoId').value = id;
    document.getElementById('novoStatus').value = statusAtual;
    toggleJustificativa();
    ui.mostrarModal('modalStatus');
  }
};

// Funções globais para os botões
async function mostrarDetalhes(id) {
  try {
    const response = await api.buscarAgendamento(id);
    ui.renderizarDetalhes(response.dados);
    ui.mostrarModal('modalDetalhes');
  } catch (error) {
    ui.mostrarToast('Erro ao carregar detalhes: ' + error.message, 'error');
  }
}

function toggleJustificativa() {
  const status = elements.novoStatus.value;
  const mostrar = status === 'Concluído' || status === 'Cancelado';
  elements.grupoJustificativa.style.display = mostrar ? 'block' : 'none';

  const justificativaInput = document.getElementById('justificativa');
  if (mostrar) {
    justificativaInput.required = true;
  } else {
    justificativaInput.required = false;
    justificativaInput.value = '';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar handlers
  handlers.inicializar();

  // Formulários
  elements.formAgendamento.addEventListener('submit', handlers.agendarColeta);
  elements.formLogin.addEventListener('submit', handlers.fazerLogin);
  elements.formFiltros.addEventListener('submit', handlers.aplicarFiltros);
  elements.formStatus.addEventListener('submit', handlers.atualizarStatus);

  // Botões
  elements.btnAdmin.addEventListener('click', () => ui.mostrarTela('telaLogin'));
  elements.btnNovoAgendamento.addEventListener('click', handlers.voltarTelaInicial);
  elements.btnVoltarLogin.addEventListener('click', () => ui.mostrarTela('telaAgendamento'));
  elements.btnLogoutHeader.addEventListener('click', handlers.logout);
  elements.btnLimparFiltros.addEventListener('click', handlers.limparFiltros);
  elements.btnDownloadAgendamento.addEventListener('click', ui.downloadComprovante);

  // Paginação
  elements.btnPrimeiraPagina.addEventListener('click', () => handlers.irParaPagina(1));
  elements.btnPaginaAnterior.addEventListener('click', () => handlers.irParaPagina(state.pagination.currentPage - 1));
  elements.btnProximaPagina.addEventListener('click', () => handlers.irParaPagina(state.pagination.currentPage + 1));
  elements.btnUltimaPagina.addEventListener('click', () => handlers.irParaPagina(state.pagination.totalPages));
  elements.itensPorPagina.addEventListener('change', handlers.alterarItensPorPagina);

  // Máscara de telefone
  elements.telefone.addEventListener('input', (e) => {
    e.target.value = utils.formatarTelefone(e.target.value);
  });

  // Validação em tempo real para telefone
  elements.telefone.addEventListener('blur', (e) => {
    const validacao = utils.validarTelefone(e.target.value);
    if (!validacao.valido) {
      ui.mostrarToast(validacao.mensagem, 'error');
    }
  });

  // Validação em tempo real para email
  const emailInput = document.getElementById('email');
  emailInput.addEventListener('blur', (e) => {
    const validacao = utils.validarEmail(e.target.value);
    if (!validacao.valido) {
      ui.mostrarToast(validacao.mensagem, 'error');
    }
  });

  // Máscara e validação para número da casa
  const numeroInput = document.getElementById('enderecoNumero');
  numeroInput.addEventListener('input', (e) => {
    // Permitir apenas números, letras (A-Z, a-z) e barra para S/N
    e.target.value = e.target.value.replace(/[^0-9a-zA-Z\/]/g, '');
  });

  numeroInput.addEventListener('blur', (e) => {
    const validacao = utils.validarNumero(e.target.value);
    if (!validacao.valido) {
      ui.mostrarToast(validacao.mensagem, 'error');
    }
  });

  // Validação para campos de texto (nome, rua, bairro, cidade)
  const camposTexto = [
    { id: 'nomeCompleto', nome: 'Nome completo', minimo: 3 },
    { id: 'enderecoRua', nome: 'Rua/Avenida', minimo: 2 },
    { id: 'enderecoBairro', nome: 'Bairro', minimo: 2 },
    { id: 'enderecoCidade', nome: 'Cidade', minimo: 2 }
  ];

  camposTexto.forEach(campo => {
    const input = document.getElementById(campo.id);
    input.addEventListener('blur', (e) => {
      const validacao = utils.validarCampoTexto(e.target.value, campo.nome, campo.minimo);
      if (!validacao.valido) {
        ui.mostrarToast(validacao.mensagem, 'error');
      }
    });
  });

  // Validação para data
  elements.dataSugerida.addEventListener('change', (e) => {
    const validacao = utils.validarData(e.target.value);
    if (!validacao.valido) {
      ui.mostrarToast(validacao.mensagem, 'error');
    }
  });

  // Validação em tempo real para campos de login
  const loginEmailInput = document.getElementById('loginEmail');
  const loginSenhaInput = document.getElementById('loginSenha');

  if (loginEmailInput) {
    loginEmailInput.addEventListener('blur', (e) => {
      if (!e.target.value || e.target.value.trim().length === 0) {
        ui.mostrarToast('E-mail é obrigatório', 'error');
        return;
      }
      const validacao = utils.validarEmail(e.target.value);
      if (!validacao.valido) {
        ui.mostrarToast(validacao.mensagem, 'error');
      }
    });

    loginEmailInput.addEventListener('input', (e) => {
      // Limpar mensagens de erro quando começar a digitar
      if (e.target.value.trim().length > 0) {
        // Validação silenciosa enquanto digita
      }
    });
  }

  if (loginSenhaInput) {
    loginSenhaInput.addEventListener('blur', (e) => {
      if (!e.target.value || e.target.value.trim().length === 0) {
        ui.mostrarToast('Senha é obrigatória', 'error');
      }
    });

    loginSenhaInput.addEventListener('input', (e) => {
      // Limpar mensagens de erro quando começar a digitar
      if (e.target.value.trim().length > 0) {
        // Validação silenciosa enquanto digita
      }
    });
  }

  // Modal status
  elements.novoStatus.addEventListener('change', toggleJustificativa);

  // Fechar modais
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      modal.classList.remove('ativo');
    });
  });

  // Fechar modal clicando fora
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('ativo');
      }
    });
  });
}); 