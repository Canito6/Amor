const { z } = require('zod');

const quizSchema = z.object({
  title: z.string().trim().min(1, 'O título do Quiz é obrigatório.').max(200),
  questions: z.array(z.object({
    questionText: z.string().trim().min(1, 'A pergunta não pode estar vazia.').max(300),
    options: z.array(z.string().trim()).min(2, 'Cada pergunta precisa de pelo menos 2 opções.'),
    creatorAnswer: z.string().trim().min(1, 'A resposta correta é obrigatória.')
  })).min(1, 'O quiz deve conter pelo menos uma pergunta.')
});

module.exports = { quizSchema };
