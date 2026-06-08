const { z } = require('zod');

const couponSchema = z.object({
  title: z.string().trim().min(1, 'O título do vale é obrigatório.').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  icon: z.string().max(20).optional().default('🎟️')
});

module.exports = { couponSchema };
