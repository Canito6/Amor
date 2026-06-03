const { z } = require('zod');

// Scratch Card Validation
const scratchCardSchema = z.object({
  title: z.string().trim().min(1, 'O título da raspadinha é obrigatório.').max(100),
  reward: z.string().trim().min(1, 'O prémio da raspadinha é obrigatório.').max(500)
});

// Decision Wheel Validation
const decisionWheelSchema = z.object({
  title: z.string().trim().min(1, 'O título da roleta é obrigatório.').max(100),
  options: z.array(z.string().trim()).min(2, 'A roleta deve conter pelo menos 2 opções.')
});

// Event Validation
const eventSchema = z.object({
  title: z.string().trim().min(1, 'O título do evento é obrigatório.').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'A data do evento é inválida.' }),
  category: z.string().optional().default('outro')
});

// Coupon Validation
const couponSchema = z.object({
  title: z.string().trim().min(1, 'O título do vale é obrigatório.').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  icon: z.string().max(20).optional().default('🎟️')
});

// Jar Note Validation
const jarNoteSchema = z.object({
  content: z.string().trim().min(1, 'O conteúdo do papelinho é obrigatório.').max(1000),
  category: z.string().max(50).optional().default('miminho')
});

// Likely Question Validation
const likelyQuestionSchema = z.object({
  text: z.string().trim().min(1, 'O texto da pergunta é obrigatório.').max(500)
});

// Likely Question Vote Validation
const voteLikelySchema = z.object({
  votedFor: z.string().trim().min(1, 'Deves votar em alguém.')
});

// Custom Tab Validation
const tabSchema = z.object({
  title: z.string().trim().min(1, 'O título da aba é obrigatório.').max(100),
  icon: z.string().max(20).optional().default('❤️'),
  accentColor: z.string().max(50).optional().default('#ff4d6d'),
  bgGradient: z.string().max(200).optional().default('linear-gradient(135deg, #ffccd5, #ffcad4)'),
  contentType: z.enum(['notes', 'media', 'link']).optional().default('notes'),
  content: z.string().max(20000).optional().default(''),
  order: z.number().optional().default(0)
});

// Open When surprise letters Validation
const openWhenSchema = z.object({
  title: z.string().trim().min(1, 'O título da carta é obrigatório.').max(200),
  content: z.string().trim().min(1, 'O conteúdo da carta é obrigatório.').max(10000),
  conditionType: z.enum(['instant', 'date', 'mood']).optional().default('instant'),
  conditionValue: z.string().max(100).optional().default('')
});

// Quiz Validation
const quizSchema = z.object({
  title: z.string().trim().min(1, 'O título do Quiz é obrigatório.').max(200),
  questions: z.array(z.object({
    questionText: z.string().trim().min(1, 'A pergunta não pode estar vazia.').max(300),
    options: z.array(z.string().trim()).min(2, 'Cada pergunta precisa de pelo menos 2 opções.'),
    creatorAnswer: z.string().trim().min(1, 'A resposta correta é obrigatória.')
  })).min(1, 'O quiz deve conter pelo menos uma pergunta.')
});

// Memory / Time Capsule Validation
const memorySchema = z.object({
  title: z.string().trim().min(1, 'O título do momento especial é obrigatório.').max(100),
  description: z.string().trim().max(1000).optional().default(''),
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'A data do momento é inválida.' }),
  isTimeCapsule: z.boolean().optional().default(false),
  unlockDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'A data de abertura da cápsula é inválida.' }).optional().nullable()
});

// Message Validation
const messageSchema = z.object({
  content: z.string().trim().min(1, 'O conteúdo da mensagem não pode estar vazio.').max(5000)
});

module.exports = {
  scratchCardSchema,
  decisionWheelSchema,
  eventSchema,
  couponSchema,
  jarNoteSchema,
  likelyQuestionSchema,
  voteLikelySchema,
  tabSchema,
  openWhenSchema,
  quizSchema,
  memorySchema,
  messageSchema
};
