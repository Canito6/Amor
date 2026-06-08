const { z } = require('zod');

const scratchCardSchema = z.object({
  title: z.string().trim().min(1, 'O título da raspadinha é obrigatório.').max(100),
  reward: z.string().trim().min(1, 'O prémio da raspadinha é obrigatório.').max(500)
});

module.exports = { scratchCardSchema };
