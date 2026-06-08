const { z } = require('zod');

const eventSchema = z.object({
  title: z.string().trim().min(1, 'O título do evento é obrigatório.').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'A data do evento é inválida.' }),
  category: z.string().optional().default('outro')
});

module.exports = { eventSchema };
