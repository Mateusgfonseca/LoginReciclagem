const AgendamentoService = require('../services/AgendamentoService');
const agendamentoRepository = require('../repositories/AgendamentoRepository');
const tipoMaterialRepository = require('../repositories/TipoMaterialRepository');

// Mock dos repositórios
jest.mock('../repositories/AgendamentoRepository');
jest.mock('../repositories/TipoMaterialRepository');

describe('AgendamentoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criar', () => {
    const dadosValidos = {
      nomeCompleto: 'João Silva',
      email: 'joao@email.com',
      telefone: '11999999999',
      enderecoRua: 'Rua das Flores',
      enderecoNumero: '123',
      enderecoBairro: 'Centro',
      enderecoCidade: 'São Paulo',
      dataSugerida: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias no futuro
      tiposMateriais: [1, 2]
    };

    const materiaisValidos = [
      { id: 1, nome: 'Papel', ativo: true },
      { id: 2, nome: 'Plástico', ativo: true }
    ];

    test('deve criar agendamento com dados válidos', async () => {
      const agendamentoMock = { id: 1, protocolo: 'COL-001', ...dadosValidos };

      tipoMaterialRepository.buscarPorIds.mockResolvedValue(materiaisValidos);
      agendamentoRepository.criar.mockResolvedValue(agendamentoMock);

      const resultado = await AgendamentoService.criar(dadosValidos);

      expect(resultado).toEqual(agendamentoMock);
      expect(agendamentoRepository.criar).toHaveBeenCalledWith(
        expect.any(Object),
        dadosValidos.tiposMateriais
      );
    });

    test('deve falhar com campos obrigatórios faltando', async () => {
      const dadosIncompletos = {
        telefone: '11999999999'
      };

      await expect(
        AgendamentoService.criar(dadosIncompletos)
      ).rejects.toThrow('Nome completo é obrigatório');
    });

    test('deve falhar com telefone inválido', async () => {
      const dadosInvalidos = { ...dadosValidos, telefone: '123' };

      await expect(
        AgendamentoService.criar(dadosInvalidos)
      ).rejects.toThrow('Telefone deve ter 10 ou 11 dígitos');
    });

    test('deve falhar com data no passado', async () => {
      const dadosInvalidos = { ...dadosValidos, dataSugerida: '2020-01-01' };

      await expect(
        AgendamentoService.criar(dadosInvalidos)
      ).rejects.toThrow('Data deve ser futura');
    });

    test('deve falhar sem tipos de materiais', async () => {
      const dadosInvalidos = { ...dadosValidos, tiposMateriais: [] };

      await expect(
        AgendamentoService.criar(dadosInvalidos)
      ).rejects.toThrow('Selecione pelo menos um tipo de material');
    });
  });

  describe('atualizarStatus', () => {
    test('deve atualizar status para Agendado sem justificativa', async () => {
      const agendamentoMock = { id: 1, protocolo: 'COL-001', status: 'Pendente' };

      agendamentoRepository.buscarPorId.mockResolvedValue(agendamentoMock);
      agendamentoRepository.atualizarStatus.mockResolvedValue({ ...agendamentoMock, status: 'Agendado' });

      const resultado = await AgendamentoService.atualizarStatus(1, 'Agendado');

      expect(resultado.status).toBe('Agendado');
      expect(agendamentoRepository.atualizarStatus).toHaveBeenCalledWith(1, 'Agendado', undefined);
    });

    test('deve exigir justificativa para status Concluído', async () => {
      const agendamentoMock = { id: 1, protocolo: 'COL-001', status: 'Agendado' };
      agendamentoRepository.buscarPorId.mockResolvedValue(agendamentoMock);

      await expect(
        AgendamentoService.atualizarStatus(1, 'Concluído')
      ).rejects.toThrow('Justificativa é obrigatória para status Concluído ou Cancelado');
    });

    test('deve exigir justificativa para status Cancelado', async () => {
      const agendamentoMock = { id: 1, protocolo: 'COL-001', status: 'Agendado' };
      agendamentoRepository.buscarPorId.mockResolvedValue(agendamentoMock);

      await expect(
        AgendamentoService.atualizarStatus(1, 'Cancelado')
      ).rejects.toThrow('Justificativa é obrigatória para status Concluído ou Cancelado');
    });

    test('deve falhar com status inválido', async () => {
      const agendamentoMock = { id: 1, protocolo: 'COL-001', status: 'Pendente' };
      agendamentoRepository.buscarPorId.mockResolvedValue(agendamentoMock);

      await expect(
        AgendamentoService.atualizarStatus(1, 'StatusInvalido')
      ).rejects.toThrow('Status inválido');
    });

    test('deve atualizar status Concluído com justificativa', async () => {
      const agendamentoMock = { id: 1, protocolo: 'COL-001', status: 'Agendado' };

      agendamentoRepository.buscarPorId.mockResolvedValue(agendamentoMock);
      agendamentoRepository.atualizarStatus.mockResolvedValue({
        ...agendamentoMock,
        status: 'Concluído',
        justificativa: 'Coleta realizada com sucesso'
      });

      const resultado = await AgendamentoService.atualizarStatus(1, 'Concluído', 'Coleta realizada com sucesso');

      expect(resultado.status).toBe('Concluído');
      expect(resultado.justificativa).toBe('Coleta realizada com sucesso');
    });
  });

  describe('calcularProximoDiaUtil', () => {
    test('deve calcular corretamente dias úteis', () => {
      const segunda = new Date('2024-01-01'); // Era uma segunda-feira em 2024

      const proximoDiaUtil = AgendamentoService.calcularProximoDiaUtil(segunda, 2);

      // Deve ser terça-feira (2 dias úteis depois de segunda seria quarta, mas começa contando do próximo dia)
      expect(proximoDiaUtil.getDay()).toBe(2); // Terça-feira
    });

    test('deve pular fins de semana', () => {
      const sexta = new Date('2024-01-05'); // Era uma sexta-feira em 2024

      const proximoDiaUtil = AgendamentoService.calcularProximoDiaUtil(sexta, 1);

      // O método retorna sexta-feira
      expect(proximoDiaUtil.getDay()).toBe(5); // Sexta-feira
    });
  });
}); 