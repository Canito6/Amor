/**
 * Utilitário de escape de HTML para evitar injeção de HTML/CSS em emails e inputs.
 * Converte caracteres especiais em entidades HTML equivalentes.
 *
 * @param {string} str - String a ser higienizada
 * @returns {string} String higienizada
 */
const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (match) => {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      default: return match;
    }
  });
};

module.exports = { escapeHTML };
