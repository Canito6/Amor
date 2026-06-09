const { z } = require('zod');

const jarNoteSchema = z.object({
  content: z.string().trim().min(1, 'O conteúdo do papelinho é obrigatório.').max(1000),
  category: z.string().max(50).optional().default('miminho')
});

module.exports = { jarNoteSchema };
