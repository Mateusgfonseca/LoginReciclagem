// Configuração global para os testes
require('dotenv').config({ path: '.env.test' });

// Mock global do console para reduzir ruído nos testes
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Configurar timezone para consistência nos testes de data
process.env.TZ = 'America/Sao_Paulo'; 