const { z } = require('zod');

const messageSchema = z.object({
  content: z.string().trim().min(1, 'O conteúdo da mensagem não pode estar vazio.').max(5000)
});

module.exports = { messageSchema };
