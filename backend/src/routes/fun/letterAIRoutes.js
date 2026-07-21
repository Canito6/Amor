const express = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const router = express.Router();

router.use(verificarToken);

// POST /api/fun/letters/generate-ai - Gerar rascunho de carta de amor com Gemini API ou Fallback
router.post('/generate-ai', async (req, res, next) => {
  try {
    const { openWhen, recipient, language = 'pt' } = req.body;
    if (!openWhen) {
      return res.status(400).json({ error: 'O motivo "Abrir quando..." é obrigatório.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = language === 'pt'
          ? `Escreve uma carta de amor curta, romântica e emocionante em português para o parceiro/a (${recipient || 'Amor'}) com o tema "Abrir Quando... ${openWhen}". Usa emojis de carinho.`
          : `Write a short, romantic, and touching love letter in English for a partner (${recipient || 'Love'}) with the theme "Open When... ${openWhen}". Include cute emojis.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return res.json({ content: text.trim() });
          }
        }
      } catch (err) {
        console.error('Erro ao chamar API Gemini para cartas:', err);
      }
    }

    // Fallback gracioso se a API falhar ou não houver chave
    const fallbackContent = language === 'pt'
      ? `Querido/a ${recipient || 'Amor'},\n\nSe estás a ler isto quando "${openWhen}", quero lembrar-te o quanto és especial para mim. Mesmo nos dias mais desafiantes, o meu coração está sempre contigo. Amo-te infinitamente! ❤️`
      : `Dear ${recipient || 'Love'},\n\nIf you are reading this when "${openWhen}", I want to remind you how deeply special you are to me. No matter what happens, my heart is always with you. I love you endlessly! ❤️`;
    
    res.json({ content: fallbackContent });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
