/**
 * Date formatting helper functions.
 * Supports pt (Portuguese) and en (English) formats.
 */

export const formatDateShort = (dateStr, language = 'pt') => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US');
};

export const formatDateLong = (dateStr, language = 'pt') => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const formatDateTime = (dateStr, language = 'pt') => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(language === 'pt' ? 'pt-PT' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
