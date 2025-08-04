const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
  beforeAll(async () => {
    // Aguardar um pouco para o app inicializar
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Fechar conexões se necessário
    if (app && app.close) {
      await app.close();
    }
  });

  describe('GET /api/materiais', () => {
    test('deve retornar lista de materiais', async () => {
      const response = await request(app)
        .get('/api/materiais')
        .expect(200);

      expect(response.body).toHaveProperty('sucesso', true);
      expect(response.body).toHaveProperty('dados');
      expect(Array.isArray(response.body.dados)).toBe(true);
    });
  });

  describe('POST /api/agendamentos', () => {
    let materialValido;

    beforeAll(async () => {
      // Buscar um material válido para usar nos testes
      const materiaisResponse = await request(app).get('/api/materiais');
      materialValido = materiaisResponse.body.dados[0]?.id || 1;
    });

    const dadosAgendamento = {
      nomeCompleto: 'João Teste API',
      email: 'joao.api@email.com',
      telefone: '11987654321',
      enderecoRua: 'Rua API',
      enderecoNumero: '456',
      enderecoBairro: 'Bairro API',
      enderecoCidade: 'Cidade API',
      dataSugerida: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      get tiposMateriais() { return [materialValido]; }
    };

    test('deve criar agendamento com dados válidos', async () => {
      const response = await request(app)
        .post('/api/agendamentos')
        .send(dadosAgendamento)
        .expect(201);

      expect(response.body).toHaveProperty('sucesso', true);
      expect(response.body).toHaveProperty('dados');
      expect(response.body.dados).toHaveProperty('protocolo');
    });

    test('deve falhar com dados inválidos', async () => {
      const dadosInvalidos = {
        nomeCompleto: 'Te', // Nome muito curto
        telefone: '123'    // Telefone inválido
      };

      const response = await request(app)
        .post('/api/agendamentos')
        .send(dadosInvalidos)
        .expect(400);

      expect(response.body).toHaveProperty('sucesso', false);
      expect(response.body).toHaveProperty('mensagem');
    });
  });

  describe('POST /api/auth/login', () => {
    test('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@coleta.com',
          senha: 'admin123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('sucesso', true);
      expect(response.body).toHaveProperty('dados');
      expect(response.body.dados).toHaveProperty('token');
    });

    test('deve falhar com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@coleta.com',
          senha: 'senhaerrada'
        })
        .expect(400);

      expect(response.body).toHaveProperty('sucesso', false);
    });
  });

  describe('Rotas protegidas', () => {
    let token;
    let materialValido;

    beforeAll(async () => {
      // Buscar um material válido para usar nos testes
      const materiaisResponse = await request(app).get('/api/materiais');
      materialValido = materiaisResponse.body.dados[0]?.id || 1;

      // Fazer login para obter token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@coleta.com',
          senha: 'admin123'
        })
        .expect(200);

      token = loginResponse.body.dados.token;
    });

    test('GET /api/agendamentos deve exigir autenticação', async () => {
      await request(app)
        .get('/api/agendamentos')
        .expect(401);
    });

    test('GET /api/agendamentos deve funcionar com token válido', async () => {
      const response = await request(app)
        .get('/api/agendamentos')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('sucesso', true);
      expect(response.body).toHaveProperty('dados');
      expect(Array.isArray(response.body.dados)).toBe(true);
    });

    test('PUT /api/agendamentos/:id/status deve atualizar status', async () => {
      // Primeiro criar um agendamento
      const createResponse = await request(app)
        .post('/api/agendamentos')
        .send({
          nomeCompleto: 'Teste Status',
          email: 'status@email.com',
          telefone: '11987654321',
          enderecoRua: 'Rua Status',
          enderecoNumero: '789',
          enderecoBairro: 'Bairro Status',
          enderecoCidade: 'Cidade Status',
          dataSugerida: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tiposMateriais: [materialValido]
        })
        .expect(201);

      const agendamentoId = createResponse.body.dados.id;

      // Atualizar status
      const response = await request(app)
        .put(`/api/agendamentos/${agendamentoId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'Agendado'
        })
        .expect(200);

      expect(response.body).toHaveProperty('sucesso', true);
    });
  });
}); 