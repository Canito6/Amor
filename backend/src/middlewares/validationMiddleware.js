/**
 * Middleware para validar o req.body baseado num esquema simples de regras.
 * Evita dependências pesadas externas e garante tipagem e formatos consistentes.
 */
const validateSchema = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Verifica se é obrigatório
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`O campo '${field}' é obrigatório.`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        // Verifica tipo string
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`O campo '${field}' deve ser uma string.`);
          continue;
        }

        // Verifica tamanho mínimo
        if (rules.minLength && typeof value === 'string' && value.trim().length < rules.minLength) {
          errors.push(`O campo '${field}' deve ter pelo menos ${rules.minLength} caracteres.`);
        }

        // Verifica formato de email
        if (rules.isEmail) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`O campo '${field}' deve ser um email válido.`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0] }); // Retorna a primeira mensagem de erro para o utilizador
    }

    next();
  };
};

module.exports = { validateSchema };
