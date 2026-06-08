const { z } = require('zod');

const openWhenSchema = z.object({
  title: z.string().trim().min(1, 'O título da carta é obrigatório.').max(200),
  content: z.string().trim().min(1, 'O conteúdo da carta é obrigatório.').max(10000),
  conditionType: z.enum(['instant', 'date', 'mood']).optional().default('instant'),
  conditionValue: z.string().max(100).optional().default('')
});

module.exports = { openWhenSchema };
