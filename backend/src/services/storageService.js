const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configurar o Cloudinary com as chaves do ficheiro .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class StorageService {
  /**
   * Faz upload de um buffer de ficheiro para o Cloudinary via Stream
   */
  async uploadFile(buffer, folder = 'o-nosso-cantinho') {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  /**
   * Apaga um ficheiro do Cloudinary extraindo o public_id a partir da URL
   */
  async deleteFile(url) {
    try {
      if (!url) return;
      const urlParts = url.split('/');
      const folderAndFile = urlParts.slice(-2).join('/'); // Retorna "o-nosso-cantinho/ficheiro.jpg"
      const publicId = folderAndFile.split('.')[0]; // Retorna "o-nosso-cantinho/ficheiro"
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Erro ao apagar ficheiro no Cloudinary:', error);
    }
  }
}

module.exports = new StorageService();
