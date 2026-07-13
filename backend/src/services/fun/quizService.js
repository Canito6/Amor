const ApiError = require('../../utils/apiError');
const { ptTemplates, enTemplates } = require('../../config/quizTemplates');

class QuizService {
  constructor(quizRepository) {
    this.quizRepository = quizRepository;
  }

  async guessQuiz(id, username, coupleId, guesses) {
    const quiz = await this.quizRepository.findById(id);

    if (!quiz) {
      throw new ApiError(404, 'Quiz não encontrado.');
    }

    if (quiz.coupleId !== coupleId) {
      throw new ApiError(403, 'Acesso negado a este quiz.');
    }

    if (quiz.createdBy === username) {
      throw new ApiError(400, 'Não podes responder ao teu próprio quiz!');
    }

    if (quiz.completed) {
      throw new ApiError(400, 'Este quiz já foi respondido.');
    }

    if (!guesses || !Array.isArray(guesses) || guesses.length !== quiz.questions.length) {
      throw new ApiError(400, 'Deves responder a todas as perguntas do quiz.');
    }

    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      const userGuess = guesses[i];
      quiz.questions[i].partnerGuess = userGuess;
      if (userGuess === quiz.questions[i].creatorAnswer) {
        score++;
      }
    }

    quiz.completed = true;
    quiz.score = score;

    await quiz.save();
    return quiz;
  }

  async generateAIQuiz(theme = 'geral', language = 'pt') {
    const normTheme = theme.toLowerCase().trim();
    let selectedTheme = 'geral';
    if (normTheme.includes('romant') || normTheme.includes('love') || normTheme.includes('amor')) {
      selectedTheme = 'romantico';
    } else if (normTheme.includes('engra') || normTheme.includes('fun') || normTheme.includes('rır') || normTheme.includes('comed')) {
      selectedTheme = 'engracado';
    } else if (normTheme.includes('futur') || normTheme.includes('amanh') || normTheme.includes('plan')) {
      selectedTheme = 'futuro';
    }

    const templates = language === 'en' ? enTemplates : ptTemplates;
    const fallbackQuiz = templates[selectedTheme] || templates['geral'];

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Estás a criar um quiz romântico e divertido para casais.
O idioma das perguntas e respostas deve ser: ${language === 'en' ? 'Inglês' : 'Português'}.
O tema ou estilo do quiz solicitado é: "${theme}".
Gera um objeto JSON válido correspondente a este esquema exato:
{
  "title": "Um título curto e apelativo para o quiz (máximo 100 caracteres)",
  "questions": [
    {
      "questionText": "Texto da pergunta (máximo 500 caracteres)",
      "options": [
        "Opção 1",
        "Opção 2",
        "Opção 3",
        "Opção 4"
      ],
      "creatorAnswer": "Exatamente uma das opções acima (ex: Opção 2), sugerida como resposta predefinida"
    }
  ]
}
Gera exatamente 5 perguntas. As opções devem ser divertidas, realistas e fáceis de responder para um casal. A resposta creatorAnswer deve corresponder exatamente a uma das opções do array options. Não incluas markdown adicional nem blocos de código além do JSON puro.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed.title && Array.isArray(parsed.questions)) {
              return {
                title: parsed.title,
                questions: parsed.questions.map(q => ({
                  questionText: q.questionText || '',
                  options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['', '', '', ''],
                  creatorAnswer: q.creatorAnswer || (q.options ? q.options[0] : '')
                })),
                aiUsed: true
              };
            }
          }
        }
      } catch (err) {
        console.error('Erro ao chamar API do Gemini. Usando fallback local:', err);
      }
    }

    // Retorna fallback local e avisa que usou fallback (aiUsed: false)
    return {
      title: fallbackQuiz.title,
      questions: fallbackQuiz.questions.map(q => ({
        questionText: q.questionText,
        options: [...q.options],
        creatorAnswer: q.creatorAnswer
      })),
      aiUsed: false
    };
  }
}
module.exports = QuizService;
