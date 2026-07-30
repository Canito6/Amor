const { z } = require('zod');

const makeMoveSchema = z.object({
  index: z.number().int().min(0).max(41, 'Índice de jogada inválido.')
});

module.exports = {
  makeMoveSchema
};
