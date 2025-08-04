# Sistema de Agenda de Coleta Seletiva

Sistema web para agendamento de coletas de materiais recicláveis, desenvolvido com foco em usabilidade, segurança e performance.

## 🚀 **Tecnologias Utilizadas**

### **Frontend**

- HTML5 semântico e acessível
- CSS3 com design responsivo e tema dark
- JavaScript ES6+ vanilla (sem frameworks)
- SPA (Single Page Application) com manipulação DOM nativa
- Validação em tempo real com feedback visual
- Sistema de notificações toast personalizadas
- Paginação client-side otimizada
- Máscaras de entrada e formatação automática

### **Backend**

- Node.js com Express.js
- Arquitetura MVC (Models, Views, Controllers)
- PostgreSQL com relacionamentos normalizados
- JWT (JSON Web Tokens) com expiração e renovação automática
- Middleware de segurança (Helmet, Rate Limiting, CORS)
- Validações robustas server-side
- Criptografia bcrypt para senhas
- Pool de conexões otimizado

### **Testes**

- Jest para testes unitários
- Supertest para testes de API
- Cobertura de código > 69%
- Testes de regras de negócio e endpoints

## 📁 **Estrutura do Projeto**

```
├── config/
│   └── database.js          # Configuração do pool PostgreSQL
├── controllers/
│   ├── AgendamentoController.js
│   ├── AuthController.js
│   └── MaterialController.js
├── middleware/
│   └── auth.js              # Middleware JWT
├── models/
│   ├── Agendamento.js
│   └── Usuario.js
├── repositories/
│   ├── AgendamentoRepository.js
│   ├── TipoMaterialRepository.js
│   └── UsuarioRepository.js
├── routes/
│   ├── agendamentos.js
│   ├── auth.js
│   └── materiais.js
├── services/
│   ├── AgendamentoService.js
│   └── AuthService.js
├── scripts/
│   ├── init_db.sql          # Schema e dados iniciais
│   └── seed.js              # Script de população
├── tests/
│   ├── agendamento.test.js  # Testes unitários
│   └── api.test.js          # Testes de integração
├── public/
│   ├── index.html
│   ├── script.js            # Frontend SPA
│   └── styles.css           # Design responsivo
└── server.js                # Servidor principal
```

## 🔧 **Configuração e Instalação**

### **Pré-requisitos**

- Node.js 14+
- PostgreSQL 12+
- NPM ou Yarn

### **1. Clonar e Instalar**

```bash
git clone [repo-url]
cd projeto-coleta-reciclavel
npm install
```

### **2. Configurar Banco de Dados**

```bash
# PostgreSQL (via pgAdmin4 ou CLI)
CREATE DATABASE agenda_coleta;
```

### **3. Variáveis de Ambiente**

```bash
# Copiar template
cp .env.example .env

# Editar .env com suas configurações
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agenda_coleta
DB_USER=seu_usuario
DB_PASS=sua_senha
JWT_SECRET=sua_chave_secreta_super_forte
PORT=3000
```

### **4. Inicializar Banco**

```bash
# Criar tabelas e dados iniciais
npm run seed
```

### **5. Executar**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Testes
npm test
```

## 🌐 **Uso do Sistema**

### **Área Pública**

- Acessar: `http://localhost:3000`
- Preencher formulário de agendamento
- Validação em tempo real dos campos
- Confirmação com protocolo e download de comprovante

### **Área Administrativa**

- Clicar em "Área Administrativa"
- **Login**: `admin@coleta.com` / `admin123`
- Filtrar agendamentos por status/data
- Visualizar detalhes completos
- Atualizar status com justificativas obrigatórias
- Paginação para grandes volumes de dados

## 🧪 **Estratégia de Testes**

### **Testes Unitários** (`tests/agendamento.test.js`)

- ✅ Validação de dados obrigatórios
- ✅ Validação de formato de telefone/email
- ✅ Cálculo de datas úteis
- ✅ Validação de materiais
- ✅ Atualização de status com justificativas

### **Testes de Integração** (`tests/api.test.js`)

- ✅ Autenticação JWT
- ✅ Criação de agendamentos
- ✅ Listagem com filtros
- ✅ Proteção de rotas
- ✅ Atualização de status

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch
```

## 🔒 **Segurança Implementada**

- **JWT com expiração**: Tokens válidos por 1 hora
- **Renovação automática**: Antes do vencimento
- **Rate Limiting**: Proteção contra força bruta
- **Helmet**: Headers de segurança
- **CORS configurado**: Apenas origens permitidas
- **Validação server-side**: Sanitização de inputs
- **Hash bcrypt**: Senhas criptografadas (salt 12)
- **SQL injection**: Queries parametrizadas

## 📊 **Performance e UX**

### **Frontend**

- **SPA Nativa**: Navegação sem recarregamento
- **Validação Real-time**: Feedback imediato
- **Paginação Local**: Resposta instantânea
- **Toast Notifications**: Feedback visual elegante
- **Loading States**: Indicadores de progresso
- **Máscaras Automáticas**: Telefone formatado
- **Design Responsivo**: Mobile-first

### **Backend**

- **Pool de Conexões**: Reutilização eficiente
- **Índices de Banco**: Consultas otimizadas
- **Middleware Pipeline**: Processamento eficiente
- **Error Handling**: Logs estruturados
- **Clean Architecture**: Separação de responsabilidades

## 🎯 **Funcionalidades Principais**

### **Agendamento Público**

- Formulário com validação completa
- Cálculo automático de datas mínimas (2 dias úteis)
- Seleção múltipla de materiais
- Geração de protocolo único
- Download de comprovante em TXT

### **Painel Administrativo**

- Autenticação segura com JWT
- Listagem paginada de agendamentos
- Filtros por status e período
- Visualização detalhada de agendamentos
- Atualização de status com workflow:
  - **Pendente → Agendado**: Sem justificativa
  - **→ Concluído**: Justificativa obrigatória
  - **→ Cancelado**: Justificativa obrigatória
- Logout seguro

### **Validações Robustas**

- **Telefone**: Formato brasileiro, anti-spam
- **Email**: RFC compliant + obrigatório
- **Datas**: Mínimo 2 dias úteis
- **Endereço**: Campos obrigatórios + formato
- **Materiais**: Seleção obrigatória
- **Status**: Workflow controlado

## 📈 **Métricas de Qualidade**

- **Cobertura de Testes**: 69.85%
- **Validações**: 100% server-side + client-side
- **Performance**: SPA + paginação otimizada
- **Segurança**: JWT + bcrypt + validações
- **UX**: Feedback em tempo real + design responsivo
- **Manutenibilidade**: Arquitetura limpa + documentação

## 🚧 **Melhorias Futuras**

- **E2E Testing**: Cypress para testes completos
- **Docker**: Containerização para deploy
- **CI/CD**: Pipeline automatizado
- **Logs**: Sistema de auditoria
- **Cache**: Redis para performance
- **Email**: Notificações automáticas
- **PWA**: Funcionalidade offline
- **Dashboard**: Analytics e relatórios

## 📝 **Scripts Disponíveis**

```bash
npm start          # Servidor produção
npm run dev        # Servidor desenvolvimento
npm test           # Executar testes
npm run test:watch # Testes em modo watch
npm run seed       # Popular banco de dados
```

---

**Desenvolvido com foco em qualidade, segurança e experiência do usuário** 🌱♻️
