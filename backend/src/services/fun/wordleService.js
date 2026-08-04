const ApiError = require('../../utils/apiError');
const eventBus = require('../../utils/eventBus');
const geminiService = require('../ai/geminiService');

const DEFAULT_ROMANTIC_WORDS = ['AMORES', 'BEIJOS', 'SONHOS', 'PAIXAO', 'ABRACO', 'DESEJO', 'CARINHO', 'JUNTOS', 'ETERNO', 'UNIAO'];

class WordleService {
  constructor(gameSessionRepository) {
    this.gameSessionRepository = gameSessionRepository;
  }

  async getOrCreateSession(coupleId) {
    let session = await this.gameSessionRepository.findByCoupleAndGame(coupleId, 'wordle');
    if (!session) {
      const defaultWord = DEFAULT_ROMANTIC_WORDS[Math.floor(Math.random() * DEFAULT_ROMANTIC_WORDS.length)];
      session = await this.gameSessionRepository.create({
        coupleId,
        gameType: 'wordle',
        players: [],
        state: {
          level: 'medium',
          mode: 'ai',        // 'ai' | 'manual'
          secretWord: defaultWord,
          wordLength: defaultWord.length,
          hint: 'Palavra romântica do casal',
          status: 'playing', // 'setting' | 'playing' | 'finished'
          attempts: [],      // array of { word, result: ['correct'|'present'|'absent'] }
          maxAttempts: 6,
          creator: 'IA',
          winner: null,
          scores: {}
        }
      });
    }
    return this._ensureStateDefaults(session);
  }

  _ensureStateDefaults(session) {
    if (!session) return session;
    if (!session.state || typeof session.state !== 'object') session.state = {};
    if (!session.state.level) session.state.level = 'medium';
    if (!session.state.mode) session.state.mode = 'ai';
    if (!session.state.status) session.state.status = 'playing';
    if (!session.state.scores || typeof session.state.scores !== 'object') session.state.scores = {};
    if (!Array.isArray(session.state.attempts)) session.state.attempts = [];
    if (!session.state.maxAttempts) session.state.maxAttempts = 6;
    return session;
  }

  async joinSession(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);
    let player = session.players.find(p => p.username === username);

    if (!player) {
      if (session.players.length >= 2) {
        throw new ApiError(400, 'A sessão de Wordle já tem 2 jogadores.');
      }
      const symbol = session.players.length === 0 ? 'X' : 'O';
      session.players.push({ username, symbol });

      if (!session.state.scores[username]) {
        session.state.scores[username] = 0;
      }

      if (typeof session.markModified === 'function') session.markModified('state');
      await session.save();
    }

    this._broadcastState(coupleId, session);
    return session;
  }

  static evaluateGuess(secretWord, guessWord) {
    const secret = secretWord.toUpperCase().split('');
    const guess = guessWord.toUpperCase().split('');
    const length = secret.length;
    const result = Array(length).fill('absent');

    const secretCounts = {};
    for (let i = 0; i < length; i++) {
      if (secret[i] !== guess[i]) {
        secretCounts[secret[i]] = (secretCounts[secret[i]] || 0) + 1;
      } else {
        result[i] = 'correct';
      }
    }

    for (let i = 0; i < length; i++) {
      if (result[i] !== 'correct') {
        const char = guess[i];
        if (secretCounts[char] && secretCounts[char] > 0) {
          result[i] = 'present';
          secretCounts[char]--;
        }
      }
    }

    return result;
  }

  async makeGuess(coupleId, username, guessWord) {
    const session = await this.getOrCreateSession(coupleId);

    if (session.state.status !== 'playing') {
      throw new ApiError(400, 'O jogo não está em curso.');
    }

    const cleanGuess = guessWord.trim().toUpperCase();
    if (cleanGuess.length !== session.state.secretWord.length) {
      throw new ApiError(400, `A palavra deve ter exatamente ${session.state.secretWord.length} letras.`);
    }

    const evalResult = WordleService.evaluateGuess(session.state.secretWord, cleanGuess);

    const attempt = {
      word: cleanGuess,
      guessedBy: username,
      result: evalResult
    };

    session.state.attempts.push(attempt);

    // Dica da IA após 3 tentativas erradas
    if (session.state.attempts.length === 3 && session.state.mode === 'ai') {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const prompt = `Gera uma pista poética e subtil em Português para ajudar a adivinhar a palavra romântica de 5/6 letras "${session.state.secretWord}". Não dás a resposta direta. Retorna apenas um JSON: { "hint": "Texto da pista" }`;
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          });
          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              if (parsed && parsed.hint) session.state.hint = parsed.hint;
            }
          }
        }
      } catch (err) {
        console.error('Erro ao gerar pista Wordle com Gemini:', err.message);
      }
    }

    const isWin = evalResult.every(r => r === 'correct');
    if (isWin) {
      session.state.status = 'finished';
      session.state.winner = username;
      session.state.scores[username] = (session.state.scores[username] || 0) + 50;
    } else if (session.state.attempts.length >= session.state.maxAttempts) {
      session.state.status = 'finished';
      session.state.winner = 'none';
    }

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async setManualWord(coupleId, username, { word, hint }) {
    const session = await this.getOrCreateSession(coupleId);
    const cleanWord = word.trim().toUpperCase();

    if (cleanWord.length < 4 || cleanWord.length > 8) {
      throw new ApiError(400, 'A palavra secreta deve ter entre 4 e 8 letras.');
    }

    session.state.secretWord = cleanWord;
    session.state.wordLength = cleanWord.length;
    session.state.hint = hint || 'Palavra definida manualmente pelo parceiro';
    session.state.creator = username;
    session.state.attempts = [];
    session.state.status = 'playing';
    session.state.winner = null;

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  async updateSettings(coupleId, username, { mode }) {
    const session = await this.getOrCreateSession(coupleId);
    if (mode && ['ai', 'manual'].includes(mode)) {
      session.state.mode = mode;
      if (mode === 'manual') {
        session.state.status = 'setting';
      }
    }
    if (typeof session.markModified === 'function') session.markModified('state');
    await session.save();
    this._broadcastState(coupleId, session);
    return session;
  }

  async resetGame(coupleId, username) {
    const session = await this.getOrCreateSession(coupleId);
    const newWord = DEFAULT_ROMANTIC_WORDS[Math.floor(Math.random() * DEFAULT_ROMANTIC_WORDS.length)];

    session.state.secretWord = newWord;
    session.state.wordLength = newWord.length;
    session.state.hint = 'Palavra romântica do casal';
    session.state.attempts = [];
    session.state.status = 'playing';
    session.state.winner = null;
    session.state.creator = 'IA';

    if (typeof session.markModified === 'function') session.markModified('state');
    session.updatedAt = new Date();
    await session.save();

    this._broadcastState(coupleId, session);
    return session;
  }

  _broadcastState(coupleId, session) {
    try {
      eventBus.emit('socket:emit', {
        room: coupleId.toString(),
        event: 'wordle-update',
        data: session.toObject ? session.toObject() : session
      });
    } catch (err) {
      console.error('Erro ao emitir evento de WebSocket para wordle:', err);
    }
  }
}

module.exports = WordleService;
