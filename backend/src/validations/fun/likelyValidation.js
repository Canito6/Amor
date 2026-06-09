const { z } = require('zod');

const likelyQuestionSchema = z.object({
  text: z.string().trim().min(1, 'O texto da pergunta é obrigatório.').max(500)
});

const voteLikelySchema = z.object({
  votedFor: z.string().trim().min(1, 'Deves votar em alguém.')
});

module.exports = { likelyQuestionSchema, voteLikelySchema };
