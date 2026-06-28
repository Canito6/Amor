/**
 * File validation utility functions.
 */

export const validateImageSize = (file, maxSizeInMB = 5) => {
  if (!file) return true;
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxBytes;
};
