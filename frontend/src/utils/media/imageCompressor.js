/**
 * Utilitário para compressão de imagens no cliente (Browser) utilizando HTML5 Canvas
 * Reduz fotos de 5MB-12MB para ~300KB antes do upload REST
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  // Se o ficheiro já for muito pequeno (menos de 200KB), não precisa de compressão
  if (file.size < 200 * 1024) {
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

        // Tenta converter para WebP ou JPEG
        const outputType = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '') + '.webp',
              { type: outputType, lastModified: Date.now() }
            );
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
