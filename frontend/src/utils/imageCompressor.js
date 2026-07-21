/**
 * Utilitário frontend para comprimir imagens antes de enviar para o servidor
 * Converte imagens para o formato WebP com máxima velocidade e dimensões otimizadas
 * 
 * @param {File} file - Ficheiro de imagem original
 * @param {object} options - Opções de compressão (maxWidth, maxHeight, quality)
 * @returns {Promise<File>} Ficheiro WebP comprimido
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82
  } = options;

  // Se não for imagem, devolve o ficheiro original sem alterações
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionar proporcionalmente se exceder os limites
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar para WebP se o browser suportar, senão usar JPEG
        const outputType = 'image/webp';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], fileName, {
              type: outputType,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
