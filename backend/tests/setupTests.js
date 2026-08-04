// Garante um JWT_SECRET consistente em todos os testes, mesmo em ambientes
// (ex.: CI, máquinas novas) sem um ficheiro .env local com esta variável.
// Só define um valor por defeito se ainda não existir nenhum — nunca
// substitui um JWT_SECRET real já configurado.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo_de_teste_default_nao_usar_em_producao';

// Mock global do Resend para evitar chamadas de rede durante os testes
jest.mock('resend');
