const { z } = require('zod');

const decisionWheelSchema = z.object({
  title: z.string().trim().min(1, 'O título da roleta é obrigatório.').max(100),
  options: z.array(z.string().trim()).min(2, 'A roleta deve conter pelo menos 2 opções.')
});

module.exports = { decisionWheelSchema };
