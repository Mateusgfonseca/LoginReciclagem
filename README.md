# Sistema de Agendamento de Coleta de Lixo Reciclável

Este é um projeto web que fiz para aprender programação e também ajudar com a coleta seletiva na minha cidade. Basicamente, as pessoas podem agendar quando querem que o lixo reciclável seja coletado na casa delas.

## O que o sistema faz?

### Para as pessoas normais:

- Tem um formulário onde você preenche seu nome, telefone, endereço
- Escolhe que tipo de material quer que seja coletado (papel, plástico, etc.)
- Marca uma data pra coleta (tem que ser pelo menos 2 dias úteis depois)
- Depois de enviar, aparece um número de protocolo pra você anotar

### Para os administradores:

- Tem uma área separada onde você faz login
- Consegue ver todos os agendamentos que as pessoas fizeram
- Pode filtrar por status (pendente, agendado, concluído, cancelado)
- Pode filtrar por data também
- Consegue mudar o status dos agendamentos
- Quando marca como concluído ou cancelado, tem que escrever o motivo

## Tecnologias que usei

**Frontend (parte que o usuário vê):**

- HTML - pra estrutura das páginas
- CSS - pra deixar bonito, usei um tema escuro
- JavaScript - pra fazer as coisas funcionarem sem recarregar a página

**Backend (servidor):**

- Node.js - ambiente pra rodar JavaScript no servidor
- Express - framework pra fazer API mais fácil
- PostgreSQL - banco de dados pra guardar as informações

**Outras coisas:**

- JWT - pra fazer login seguro
- bcrypt - pra criptografar senhas
- Jest - pra fazer testes

## Como rodar na sua máquina

### Você vai precisar ter instalado:

- Node.js (baixa do site oficial)
- PostgreSQL (eu uso o pgAdmin4)

### Passos:

1. **Baixar o projeto**

```bash
# Se você tem git instalado
git clone [link-do-projeto]
cd projeto-coleta

# Instalar as dependências
npm install
```

2. **Configurar o banco de dados**

- Abre o pgAdmin4
- Cria um banco chamado `agenda_coleta`

3. **Configurar as variáveis**

- Copia o arquivo `.env.example` e renomeia para `.env`
- Edita o arquivo com suas configurações do banco:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agenda_coleta
DB_USER=postgres
DB_PASS=sua_senha_do_postgres
JWT_SECRET=qualquer_coisa_aqui
PORT=3000
```

4. **Criar as tabelas e dados iniciais**

```bash
npm run seed
```

5. **Rodar o sistema**

```bash
# Para desenvolvimento (reinicia automático quando você mexe no código)
npm run dev

# Para produção
npm start
```

6. **Acessar**

- Vai no navegador: `http://localhost:3000`
- Para área admin: clica em "Área Administrativa"
- Login: `admin@coleta.com` senha: `admin123`

## Como usar

### Fazer um agendamento:

1. Preenche o formulário na página inicial
2. Escolhe os materiais
3. Marca uma data (não pode ser hoje nem amanhã, tem que ser dia útil)
4. Clica em "Agendar Coleta"
5. Anota o número do protocolo que aparece

### Gerenciar agendamentos (admin):

1. Clica em "Área Administrativa"
2. Faz login
3. Ve a lista de agendamentos
4. Pode filtrar por status ou data
5. Clica em "Ver Detalhes" pra ver tudo
6. Clica em "Atualizar Status" pra mudar
7. Se marcar como concluído ou cancelado, tem que escrever o motivo

## Problemas que resolvi

### Validações:

- O telefone não pode ser tipo 11111111111 (números repetidos)
- Email tem que ter formato válido (tem @ e ponto)
- Data não pode ser no passado nem muito próxima
- Todos os campos obrigatórios tem que estar preenchidos

### Segurança:

- Senhas são criptografadas no banco
- Token de login expira em 1 hora
- Validação tanto no frontend quanto no backend
- Proteção contra ataques básicos

### Interface:

- Responsiva (funciona no celular)
- Mostra mensagens de erro/sucesso
- Paginação quando tem muitos agendamentos
- Não precisa recarregar a página

## Testes

Fiz alguns testes básicos pra garantir que funciona:

```bash
# Rodar todos os testes
npm test
```

Os testes verificam:

- Se as validações estão funcionando
- Se a API está respondendo certo
- Se o login funciona
- Se os filtros funcionam

## Estrutura dos arquivos

```
projeto/
├── public/           # Arquivos do frontend
│   ├── index.html   # Página principal
│   ├── script.js    # JavaScript do frontend
│   └── styles.css   # Estilos CSS
├── controllers/     # Controladores da API
├── services/        # Lógica de negócio
├── repositories/    # Acesso ao banco de dados
├── models/          # Modelos de dados
├── tests/           # Testes automatizados
├── scripts/         # Scripts utilitários
└── server.js        # Arquivo principal do servidor
```

## Comandos úteis

```bash
npm start          # Roda o servidor
npm run dev        # Roda em modo desenvolvimento
npm test           # Executa os testes
npm run seed       # Popula o banco com dados iniciais
```

## Coisas que eu gostaria de melhorar

- Mandar email quando agendar ou mudar status
- Integração com mapa pra mostrar as rotas
- App mobile
- Relatórios mais detalhados
- Sistema de avaliação da coleta
- Notificações por WhatsApp

## Problemas conhecidos

- Não tem recuperação de senha (tem que pedir pro admin resetar)
- Não valida CEP real (aceita qualquer endereço)
- Não tem backup automático do banco
- Interface poderia ser mais bonita

---
