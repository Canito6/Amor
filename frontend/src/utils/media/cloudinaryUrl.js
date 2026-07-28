/**
 * Otimiza URLs de imagens do Cloudinary inserindo transformações automáticas
 * (formato e qualidade otimizados, e opcionalmente um limite de largura).
 *
 * Isto reduz drasticamente o tamanho das imagens transferidas (o Cloudinary
 * escolhe automaticamente o formato mais leve suportado pelo browser, ex.
 * WebP/AVIF, e ajusta a qualidade sem perda visível), sem qualquer alteração
 * nos ficheiros originais guardados.
 *
 * Se a URL não for do Cloudinary (ex: placeholder local, avatar por omissão),
 * é devolvida inalterada.
 *
 * @param {string} url - URL original da imagem (tipicamente vinda do Cloudinary)
 * @param {Object} [options]
 * @param {number} [options.width] - Largura máxima desejada em pixels (redimensiona e faz crop 'limit', nunca amplia)
 * @param {string} [options.quality='auto'] - Qualidade Cloudinary (ex: 'auto', 'auto:good')
 * @param {string} [options.format='auto'] - Formato Cloudinary (ex: 'auto')
 * @returns {string} URL otimizada (ou a original se não for reconhecida como Cloudinary)
 */
export function optimizeCloudinaryUrl(url, { width, quality = 'auto', format = 'auto' } = {}) {
  if (!url || typeof url !== 'string') return url;

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url;

  const afterMarker = url.slice(idx + marker.length);

  // Evita duplicar transformações se a URL já as tiver (ex: já processada antes)
  if (/^[a-z]_[^/]+\//.test(afterMarker) && /f_auto|q_auto/.test(afterMarker.split('/')[0])) {
    return url;
  }

  const transforms = [`f_${format}`, `q_${quality}`];
  if (width) transforms.push(`c_limit`, `w_${width}`);

  const before = url.slice(0, idx + marker.length);
  return `${before}${transforms.join(',')}/${afterMarker}`;
}
