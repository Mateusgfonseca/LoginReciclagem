require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Iniciando seed do banco de dados...');

    // Criar usuário admin se não existir
    const adminExists = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      ['admin@coleta.com']
    );

    if (adminExists.rows.length === 0) {
      const senhaHash = await bcrypt.hash('admin123', 12);
      await client.query(
        'INSERT INTO usuarios (email, senha, nome) VALUES ($1, $2, $3)',
        ['admin@coleta.com', senhaHash, 'Administrador']
      );
      console.log('✅ Usuário admin criado');
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }

    // Verificar se tipos de material existem
    const materiaisCount = await client.query('SELECT COUNT(*) FROM tipos_material');

    if (parseInt(materiaisCount.rows[0].count) === 0) {
      const materiais = [
        ['Papel/Papelão', 'Jornais, revistas, caixas de papelão, papel de escritório'],
        ['Plástico', 'Garrafas PET, embalagens plásticas, sacos plásticos'],
        ['Metal', 'Latas de alumínio, latas de aço, metais ferrosos'],
        ['Vidro', 'Garrafas de vidro, potes, frascos'],
        ['Eletrônicos', 'Computadores, celulares, eletrodomésticos pequenos'],
        ['Óleo de Cozinha', 'Óleo usado de frituras e cozimento']
      ];

      for (const [nome, descricao] of materiais) {
        await client.query(
          'INSERT INTO tipos_material (nome, descricao) VALUES ($1, $2)',
          [nome, descricao]
        );
      }
      console.log('✅ Tipos de material criados');
    } else {
      console.log('ℹ️  Tipos de material já existem');
    }

    // Criar agendamentos de exemplo
    const agendamentosExist = await client.query('SELECT COUNT(*) FROM agendamentos');

    if (parseInt(agendamentosExist.rows[0].count) === 0) {
      console.log('📅 Criando agendamentos de exemplo...');

      // Buscar IDs dos materiais disponíveis
      const materiaisDisponiveis = await client.query('SELECT id FROM tipos_material ORDER BY id LIMIT 2');
      const materiaisIds = materiaisDisponiveis.rows.map(row => row.id);

      if (materiaisIds.length === 0) {
        console.log('⚠️  Nenhum material encontrado. Pulando criação de agendamentos.');
        return;
      }

      const agendamentosExemplo = [
        {
          protocolo: 'COL-' + Date.now().toString().slice(-6),
          nome_completo: 'João Silva Santos',
          email: 'joao.silva@email.com',
          telefone: '11987654321',
          endereco_rua: 'Rua das Flores',
          endereco_numero: '123',
          endereco_bairro: 'Centro',
          endereco_cidade: 'São Paulo',
          data_sugerida: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Pendente'
        },
        {
          protocolo: 'COL-' + (Date.now() + 1000).toString().slice(-6),
          nome_completo: 'Maria Oliveira Costa',
          email: 'maria.oliveira@email.com',
          telefone: '11976543210',
          endereco_rua: 'Avenida Paulista',
          endereco_numero: '456',
          endereco_bairro: 'Bela Vista',
          endereco_cidade: 'São Paulo',
          data_sugerida: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Agendado'
        },
        {
          protocolo: 'COL-' + (Date.now() + 2000).toString().slice(-6),
          nome_completo: 'Pedro Henrique Alves',
          email: 'pedro.alves@email.com',
          telefone: '11965432109',
          endereco_rua: 'Rua Augusta',
          endereco_numero: '789',
          endereco_bairro: 'Consolação',
          endereco_cidade: 'São Paulo',
          data_sugerida: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Concluído'
        }
      ];

      for (const agendamento of agendamentosExemplo) {
        const result = await client.query(
          `INSERT INTO agendamentos 
           (protocolo, nome_completo, email, telefone, endereco_rua, endereco_numero, 
            endereco_bairro, endereco_cidade, data_sugerida, status, criado_em, atualizado_em) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) 
           RETURNING id`,
          [
            agendamento.protocolo,
            agendamento.nome_completo,
            agendamento.email,
            agendamento.telefone,
            agendamento.endereco_rua,
            agendamento.endereco_numero,
            agendamento.endereco_bairro,
            agendamento.endereco_cidade,
            agendamento.data_sugerida,
            agendamento.status
          ]
        );

        // Adicionar materiais aos agendamentos usando IDs reais
        const agendamentoId = result.rows[0].id;

        for (const materialId of materiaisIds) {
          await client.query(
            'INSERT INTO agendamento_materiais (agendamento_id, tipo_material_id) VALUES ($1, $2)',
            [agendamentoId, materialId]
          );
        }
      }

      console.log('✅ Agendamentos de exemplo criados');
    } else {
      console.log('ℹ️  Agendamentos já existem');
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('   Email: admin@coleta.com');
    console.log('   Senha: admin123');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seed();
}

module.exports = seed; 