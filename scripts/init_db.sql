-- Criar banco de dados
CREATE DATABASE agenda_coleta;

-- Usar o banco
\c agenda_coleta;

-- Tabela de usuários (administradores)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de material
CREATE TABLE tipos_material (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    protocolo VARCHAR(20) UNIQUE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20) NOT NULL,
    endereco_rua VARCHAR(255) NOT NULL,
    endereco_numero VARCHAR(10) NOT NULL,
    endereco_bairro VARCHAR(100) NOT NULL,
    endereco_cidade VARCHAR(100) NOT NULL,
    data_sugerida DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Agendado', 'Concluído', 'Cancelado')),
    justificativa TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento agendamento-material
CREATE TABLE agendamento_materiais (
    id SERIAL PRIMARY KEY,
    agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE CASCADE,
    tipo_material_id INTEGER REFERENCES tipos_material(id) ON DELETE CASCADE,
    UNIQUE(agendamento_id, tipo_material_id)
);

-- Inserir tipos de materiais padrão
INSERT INTO tipos_material (nome, descricao) VALUES
('Papel/Papelão', 'Jornais, revistas, caixas de papelão, papel de escritório'),
('Plástico', 'Garrafas PET, embalagens plásticas, sacos plásticos'),
('Metal', 'Latas de alumínio, latas de aço, metais ferrosos'),
('Vidro', 'Garrafas de vidro, potes, frascos'),
('Eletrônicos', 'Computadores, celulares, eletrodomésticos pequenos'),
('Óleo de Cozinha', 'Óleo usado de frituras e cozimento');

-- Criar usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (email, senha, nome) VALUES 
('admin@coleta.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfLY5wB7f0PZxLy', 'Administrador');

-- Índices para performance
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_sugerida);
CREATE INDEX idx_agendamentos_protocolo ON agendamentos(protocolo); 