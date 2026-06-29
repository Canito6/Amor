const FileType = require('file-type');
const sharp = require('sharp');
const ApiError = require('../utils/apiError');

/**
 * Middleware para validar a integridade de imagens carregadas via Multer.
 * 1. Verifica se o ficheiro é realmente uma imagem legítima (prevenção de MIME spoofing) usando magic bytes.
 * 2. Remove todos os metadados EXIF e GPS usando sharp para garantir privacidade.
 * 3. Corrige a orientação automática baseada no EXIF original.
 */
const imageProcessor = async (req, res, next) => {
  try {
    // Se não existir ficheiro carregado, passa para o próximo middleware/controller
    if (!req.file) {
      return next();
    }

    // 1. Validar o tipo real de ficheiro baseado nos "magic numbers" (assinatura de bytes)
    const typeInfo = await FileType.fromBuffer(req.file.buffer);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!typeInfo || !allowedMimeTypes.includes(typeInfo.mime)) {
      return next(new ApiError(400, 'Ficheiro inválido. Apenas são permitidas imagens reais (JPEG, PNG, WEBP, GIF).'));
    }

    // 2. Processar a imagem com sharp
    try {
      let sharpInstance;
      if (typeInfo.mime === 'image/gif') {
        // Ativar suporte para GIFs animados se necessário
        sharpInstance = sharp(req.file.buffer, { animated: true });
      } else {
        sharpInstance = sharp(req.file.buffer);
      }

      // rotate() corrige a rotação da imagem conforme metadados EXIF.
      // toBuffer() remove automaticamente todos os metadados EXIF/IPTC/XMP de forma segura (não chamamos .withMetadata())
      const cleanBuffer = await sharpInstance.rotate().toBuffer();

      // 3. Atualizar as propriedades do ficheiro na requisição para que sejam enviadas higienizadas
      req.file.buffer = cleanBuffer;
      req.file.size = cleanBuffer.length;
      req.file.mimetype = typeInfo.mime;
    } catch (sharpError) {
      return next(new ApiError(400, 'Falha ao processar o ficheiro de imagem. Certifica-te de que o ficheiro não está corrompido.'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = imageProcessor;
