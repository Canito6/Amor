const { z } = require('zod');

const submitScoreSchema = z.object({
  gameType: z.enum(['memory', 'quiz', 'likely', 'scratch_card', 'custom'], {
    errorMap: () => ({ message: 'Tipo de jogo inválido para submissão direta do cliente.' })
  }),
  points: z.number().int().min(1, 'A pontuação deve ser maior que 0.').max(500, 'A pontuação excede o limite máximo permitido por jogo.'),
  metadata: z.record(z.any()).optional()
});

module.exports = {
  submitScoreSchema
};
