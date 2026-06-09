const { z } = require('zod');

const memorySchema = z.object({
  title: z.string().trim().min(1, 'O título do momento especial é obrigatório.').max(100),
  description: z.string().trim().max(1000).optional().default(''),
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'A data do momento é inválida.' }),
  isTimeCapsule: z.boolean().optional().default(false),
  unlockDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'A data de abertura da cápsula é inválida.' }).optional().nullable()
});

module.exports = { memorySchema };
