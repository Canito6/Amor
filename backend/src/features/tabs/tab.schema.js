const { z } = require('zod');

const tabSchema = z.object({
  title: z.string().trim().min(1, 'O título da aba é obrigatório.').max(100),
  icon: z.string().max(20).optional().default('❤️'),
  accentColor: z.string().max(50).optional().default('#ff4d6d'),
  bgGradient: z.string().max(200).optional().default('linear-gradient(135deg, #ffccd5, #ffcad4)'),
  contentType: z.enum(['notes', 'media', 'link']).optional().default('notes'),
  content: z.string().max(20000).optional().default(''),
  order: z.number().optional().default(0)
});

module.exports = { tabSchema };
