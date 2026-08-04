// Fallbacks Locais Curados para Nível Fácil, Médio e Difícil 🔥🔞
const LOCAL_TRUTHS = {
  easy: [
    "Qual foi o exato momento em que percebeste que estavas apaixonado(a) por mim?",
    "Qual é a tua memória favorita de um encontro nosso no início do namoro?",
    "Se pudesses viajar comigo para qualquer lugar do mundo amanhã, para onde iríamos?",
    "Qual é a coisa mais fofa que eu faço sem me aperceber?",
    "Qual foi o primeiro pensamento que tiveste quando me viste pela primeira vez?",
    "O que em mim te faz sorrir instantaneamente, mesmo num dia mau?",
    "Qual é a música que mais te faz lembrar a nossa história de amor?",
    "Se fosses descrever a nossa relação em apenas três palavras, quais seriam?"
  ],
  medium: [
    "Qual foi a roupa ou visual meu que mais te deixou com vontade de me agarrar?",
    "Qual é a carícia ou toque meu que te dá logo arrepios no corpo?",
    "Onde é o teu sítio favorito para receber beijos meus?",
    "Qual foi o sonho mais romântico ou atrevido que já tiveste comigo?",
    "Qual é o segredo sobre a tua atração por mim que nunca me contaste?",
    "Se estivéssemos numa ilha deserta só nós os dois, qual seria a primeira coisa que fazias comigo?",
    "Qual é a parte do meu corpo que mais te dá água na boca?",
    "Qual foi a loucura mais atrevida que já pensaste fazer comigo em público?"
  ],
  hard: [
    "Qual é a tua fantasia sexual mais secreta e picante que queres realizar comigo?",
    "Em que lugar invulgar da casa ou fora dela mais gostarias de ter uma noite de paixão comigo?",
    "Qual foi a posição ou momento erótico nosso que mais te levou ao delírio?",
    "O que é que eu faço na cama que te deixa completamente louco(a) de desejo?",
    "Qual é o tipo de lingerie/roupa interior ou acessório que mais te excita ver em mim?",
    "Se tivesses o controlo total do meu corpo durante 15 minutos sem limites, o que me fazias?",
    "Qual é o sussurro ou palavra dita ao ouvido durante o ato que mais te descontrola?",
    "Qual é aquele desejo sensual ousado que ainda tens vergonha de me pedir na cama?"
  ]
};

const LOCAL_DARES = {
  easy: [
    "Dá um beijo apaixonado de 15 segundos nos lábios do teu parceiro(a).",
    "Faz uma massagem carinhosa nos ombros do teu parceiro(a) durante 1 minuto.",
    "Olha fixamente nos olhos do teu parceiro(a) por 30 segundos sem me rir e diz um elogio sincero.",
    "Dá 5 beijinhos carinhosos na cara e pescoço do teu parceiro(a).",
    "Desenha um coração com o dedo na costas do teu parceiro(a) e deixa-o(a) adivinhar o que escreveste.",
    "Faz uma jura de amor romântica em tom dramático e divertido para o teu parceiro(a)."
  ],
  medium: [
    "Dá 10 beijos sensuais e lentos no pescoço do teu parceiro(a).",
    "Faz uma massagem arrepiante nas coxas ou costas do teu parceiro(a) por 2 minutos.",
    "Sussurra uma frase extremamente provocante e atrevida no ouvido do teu parceiro(a).",
    "Abraça o teu parceiro(a) bem colado(a) por 45 segundos sentindo o calor do corpo.",
    "Tira uma peça de roupa tua (á tua escolha) até ao fim da partida.",
    "Dá um beijo mordiscado e guloso nos lábios do teu parceiro(a)."
  ],
  hard: [
    "Faz uma massagem sensual com toques provocantes no corpo do teu parceiro(a) durante 3 minutos.",
    "Dá beijos quentes e provocantes no peito/barriga do teu parceiro(a) por 1 minuto.",
    "Tira duas peças de roupa tuas e fica na posição mais sensual que conseguires por 1 minuto.",
    "Faz uma simulação de sedução erótica ao ouvido do teu parceiro(a) descrevendo o que lhe vais fazer mais logo.",
    "Dá um beijo com língua apaixonado e intenso segurando o teu parceiro(a) com força por 30 segundos.",
    "Veda os olhos do teu parceiro(a) com as mãos e dá-lhe 3 beijos em zonas surpresa do corpo."
  ]
};

const LOCAL_PENALTIES = {
  easy: [
    "Penalização: Faz 10 flexões/agachamentos enquanto dizes 'eu amo o meu parceiro(a)' a cada repetição!",
    "Penalização: Faz uma massagem aos pés do teu parceiro(a) durante 2 minutos sem reclamar!",
    "Penalização: Serve um copo de água/bebida ao teu parceiro(a) a tratar por 'Meu Rei / Minha Rainha'."
  ],
  medium: [
    "Penalização Obrigatória: Fica sem camisola/t-shirt durante as próximas 3 jogadas!",
    "Penalização Obrigatória: Deixa o teu parceiro(a) fazer-te uma sessão de cócegas/massagem de 1 minuto sem te poderes esquivar!",
    "Penalização Obrigatória: Dá 15 beijos intensos no pescoço do teu parceiro(a) sem parar!"
  ],
  hard: [
    "PENALIZAÇÃO OBRIGATÓRIA 🔥🔞: Tira duas peças de roupa imediatamente e faz uma massagem sensual ao teu parceiro(a) durante 3 minutos!",
    "PENALIZAÇÃO OBRIGATÓRIA 🔥🔞: Veda os olhos e deixa o teu parceiro(a) dar-te beijos onde ele(a) quiser no teu corpo durante 2 minutos!",
    "PENALIZAÇÃO OBRIGATÓRIA 🔥🔞: Sussurra a tua maior fantasia erótica ao ouvido do teu parceiro(a) e cumpre uma carícia ousada!"
  ]
};

class GeminiService {
  /**
   * Gerar Verdade ou Consequência usando a API do Gemini 2.5 Flash
   */
  async generateTruthOrDare({ level = 'medium', type = 'truth', coupleNames = ['Canito', 'Lara'] }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const typeText = type === 'truth' ? 'uma PERGUNTA DE VERDADE' : 'um DESAFIO / CONSEQUÊNCIA PRÁTICA';
        let levelDesc = '';

        if (level === 'easy') {
          levelDesc = 'Nível Fofo & Leve (romântico, carinhoso, focado em memórias bonitas e cumplicidade de casal).';
        } else if (level === 'medium') {
          levelDesc = 'Nível Picante Moderado (provocante, flerte, sedução leve, carícias e segredos atrevidos).';
        } else {
          levelDesc = 'Nível Difícil / Apimentado 🔥🔞 (extremamente sensual, erótico, fantasias íntimas, preliminares e desafios picantes de teor sexual sem tabus).';
        }

        const prompt = `És um especialista em jogos românticos e sensuais de casal. Gera ${typeText} para um casal de namorados (usa termos genéricos como 'o teu parceiro(a)').
Nível de intensidade: ${levelDesc}
Regras:
1. Deve ser escrito em Português de Portugal (PT-PT).
2. NUNCA incluas nomes próprios nem dados pessoais. Usa 'o teu parceiro(a)'.
3. Se for 'truth', deve ser uma pergunta envolvente para o parceiro responder.
4. Se for 'dare', deve ser uma ação prática apaixonada/provocante para realizar na hora.
5. Não incluas introduções nem saudações. Retorna apenas um JSON válido com o seguinte formato:
{
  "content": "Texto da pergunta ou desafio aqui",
  "category": "${type}",
  "level": "${level}"
}`;

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
            if (parsed && parsed.content) {
              return {
                content: parsed.content,
                category: type,
                level,
                aiGenerated: true
              };
            }
          }
        }
      } catch (err) {
        console.error('Erro ao chamar API Gemini (TruthOrDare). A usar fallback local:', err.message);
      }
    }

    // Fallback Local se a API não estiver disponível
    const pool = type === 'truth' ? (LOCAL_TRUTHS[level] || LOCAL_TRUTHS.medium) : (LOCAL_DARES[level] || LOCAL_DARES.medium);
    const randomIndex = Math.floor(Math.random() * pool.length);

    return {
      content: pool[randomIndex],
      category: type,
      level,
      aiGenerated: false
    };
  }

  /**
   * Gerar Consequência Obrigatória de Penalização em caso de recusa
   */
  async generatePenaltyConsequence({ level = 'medium' }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Gera uma CONSEQUÊNCIA OBRIGATÓRIA DE PENALIZAÇÃO em Português (PT-PT) para um parceiro de casal que se recusou a cumprir um desafio no jogo Verdade ou Consequência.
Nível: ${level === 'hard' ? 'Difícil / Apimentado 🔥🔞 (sensual, ousado, castigo provocante e picante)' : level === 'medium' ? 'Médio (divertido, beijos/massagem obrigatoria)' : 'Fácil (mimo obrigatorio)'}.
A penalização deve ser irresistível e inegociável.
Retorna apenas um JSON: { "content": "Texto da penalização" }`;

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
            if (parsed && parsed.content) {
              return { content: parsed.content, aiGenerated: true };
            }
          }
        }
      } catch (err) {
        console.error('Erro ao gerar penalização com Gemini:', err.message);
      }
    }

    const pool = LOCAL_PENALTIES[level] || LOCAL_PENALTIES.medium;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return { content: pool[randomIndex], aiGenerated: false };
  }

  /**
   * 1. Gerar Rascunho de Carta de Amor "Abrir Quando..."
   */
  async generateLoveLetter({ category = 'saudades' }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Gera uma carta de amor emocionante e poética em Português (PT-PT) para uma carta do tipo "Abrir quando estiveres com ${category}".
Usa linguagem romântica e genérica (ex: 'meu amor', 'minha vida').
Retorna apenas um JSON: { "title": "Título carinhoso", "content": "Texto emocionante da carta" }`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed && parsed.content) return { ...parsed, aiGenerated: true };
          }
        }
      } catch (err) {
        console.error('Erro ao gerar carta com Gemini:', err.message);
      }
    }
    return {
      title: `Carta para quando sentires ${category}`,
      content: `Meu amor, escrevo-te esta carta para te lembrar do quanto és especial para mim. Mesmo nos momentos mais difíceis ou distantes, o meu coração está sempre contigo. Amo-te infinitamente! ❤️`,
      aiGenerated: false
    };
  }

  /**
   * 2. Gerar Plano de Encontro Temático (Date Night AI Planner)
   */
  async generateDateNightPlan({ theme = 'caseiro' }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Gera uma ideia criativa de encontro a dois (Date Night) em Português (PT-PT) com o tema "${theme}".
Retorna apenas um JSON: { "title": "Nome do Encontro", "description": "Resumo do encontro", "activity": "Atividade principal a realizar juntos", "atmosphere": "Dicas de iluminação e ambiente" }`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed && parsed.title) return { ...parsed, aiGenerated: true };
          }
        }
      } catch (err) {
        console.error('Erro ao gerar encontro com Gemini:', err.message);
      }
    }
    return {
      title: '🍷 Noite de Cinema & Petiscos em Casa',
      description: 'Uma noite relaxante na sala com luzes suaves e a vossa comida favorita.',
      activity: 'Ver um filme romântico ou de comédia com pipocas e fondue de chocolate.',
      atmosphere: 'Velas aromáticas e mantas confortáveis no sofá.',
      aiGenerated: false
    };
  }

  /**
   * 3. Gerar Ideias de Vales & Raspadinhas do Amor
   */
  async generateCouponIdea({ type = 'mimo' }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Gera uma ideia de Vale do Amor / Recompensa romântica em Português (PT-PT) do tipo "${type}".
Retorna apenas um JSON: { "title": "Título do Vale (ex: Massagem)", "description": "Detalhes fofos da recompensa", "icon": "Emoji sugestivo" }`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed && parsed.title) return { ...parsed, aiGenerated: true };
          }
        }
      } catch (err) {
        console.error('Erro ao gerar vale com Gemini:', err.message);
      }
    }
    return {
      title: '💆 Massagem Relaxante Sem Limite',
      description: 'Vale uma massagem relaxante nas costas e ombros com óleo essencial.',
      icon: '💆‍♂️',
      aiGenerated: false
    };
  }

  /**
   * 4. Gerar Nota Diária Surpresa no Frasco do Amor
   */
  async generateJarNote({ category = 'amor' }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Gera um bilhete romântico curto (1 a 2 frases) em Português (PT-PT) para um frasco de notas do casal.
Retorna apenas um JSON: { "content": "Texto do bilhete fofo" }`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed && parsed.content) return { ...parsed, aiGenerated: true };
          }
        }
      } catch (err) {
        console.error('Erro ao gerar nota do frasco com Gemini:', err.message);
      }
    }
    return {
      content: 'Apenas uma nota para te lembrar que o teu sorriso é a minha coisa favorita no mundo inteiro! ❤️',
      aiGenerated: false
    };
  }

  /**
   * 5. Gerar Resumo Semanal de Afinidade (AI Love Insights)
   */
  async generateLoveInsights() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Gera uma mensagem poética motivacional de 2 frases em Português (PT-PT) sobre a cumplicidade e amor de um casal que joga e celebra a sua relação juntos.
Retorna apenas um JSON: { "insight": "Frase motivacional romântica" }`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json' } })
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed && parsed.insight) return { ...parsed, aiGenerated: true };
          }
        }
      } catch (err) {
        console.error('Erro ao gerar insights com Gemini:', err.message);
      }
    }
    return {
      insight: 'A vossa cumplicidade cresce a cada momento partilhado. Continuem a cultivar este amor único todos os dias! 💕',
      aiGenerated: false
    };
  }
}

module.exports = new GeminiService();
