const { z } = require('zod');

const makeMoveSchema = z.object({
  index: z.number().int().min(0).max(8, 'Índice de jogada inválido. Deve estar entre 0 e 8.')
});

module.exports = {
  makeMoveSchema
};
