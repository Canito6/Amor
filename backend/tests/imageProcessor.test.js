const imageProcessor = require('../src/middlewares/imageProcessor');
const ApiError = require('../src/utils/apiError');
const sharp = require('sharp');

// 1x1 Pixel valid PNG em formato hexadecimal
const VALID_PNG_HEX = '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082';
const VALID_PNG_BUFFER = Buffer.from(VALID_PNG_HEX, 'hex');

// Conteúdo de texto simulando um script malicioso disfarçado de imagem (MIME spoofing)
const SPOOF_HTML_BUFFER = Buffer.from('<html><script>alert("XSS")</script></html>', 'utf-8');

// Buffer corrompido que finge ser PNG na assinatura mas está truncado e inválido
const CORRUPT_PNG_BUFFER = Buffer.from('89504e470d0a1a0a0000000d494844520000000000000000', 'hex');

describe('Middleware de Segurança - imageProcessor', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    nextFunction = jest.fn();
  });

  it('deve chamar next() imediatamente se não houver ficheiro carregado', async () => {
    mockReq.file = undefined;

    await imageProcessor(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('deve processar com sucesso uma imagem PNG válida e converter para webp', async () => {
    mockReq.file = {
      buffer: VALID_PNG_BUFFER,
      originalname: 'teste.png',
      mimetype: 'image/png',
      size: VALID_PNG_BUFFER.length
    };

    await imageProcessor(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
    
    // O buffer deve ter sido processado e atualizado para WebP
    expect(mockReq.file.buffer).toBeInstanceOf(Buffer);
    expect(mockReq.file.mimetype).toEqual('image/webp');
    expect(mockReq.file.originalname).toEqual('teste.webp');
  });

  it('deve rejeitar e retornar erro 400 para tentativas de MIME spoofing', async () => {
    mockReq.file = {
      buffer: SPOOF_HTML_BUFFER,
      originalname: 'foto.png', // extensão disfarçada
      mimetype: 'image/png', // mimetype disfarçado
      size: SPOOF_HTML_BUFFER.length
    };

    await imageProcessor(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
    const errorPassed = nextFunction.mock.calls[0][0];
    expect(errorPassed.statusCode).toEqual(400);
    expect(errorPassed.message).toContain('Ficheiro inválido. Apenas são permitidas imagens reais');
  });

  it('deve retornar erro 400 se a imagem estiver corrompida e o sharp falhar no processamento', async () => {
    mockReq.file = {
      buffer: CORRUPT_PNG_BUFFER,
      originalname: 'corrompida.png',
      mimetype: 'image/png',
      size: CORRUPT_PNG_BUFFER.length
    };

    await imageProcessor(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ApiError));
    const errorPassed = nextFunction.mock.calls[0][0];
    expect(errorPassed.statusCode).toEqual(400);
    expect(errorPassed.message).toContain('Falha ao processar o ficheiro de imagem');
  });
});
