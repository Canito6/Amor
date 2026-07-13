const ptTemplates = {
  romantico: {
    title: "O Nosso Amor & Romance 💖",
    questions: [
      {
        questionText: "Qual seria a minha viagem de sonho contigo?",
        options: ["Paris, a cidade do amor", "Uma cabana isolada na neve", "Uma praia tropical nas Maldivas", "Uma roadtrip pelas capitais europeias"],
        creatorAnswer: "Uma praia tropical nas Maldivas"
      },
      {
        questionText: "O que eu mais valorizo na nossa relação?",
        options: ["A cumplicidade e as conversas longas", "Os abraços e o carinho físico", "O apoio mútuo nas dificuldades", "Rirmos juntos até chorar"],
        creatorAnswer: "A cumplicidade e as conversas longas"
      },
      {
        questionText: "Onde seria o meu encontro ideal para comemorar o nosso aniversário?",
        options: ["Um jantar num restaurante chique à luz de velas", "Um piquenique ao pôr do sol", "Ficarmos em casa a cozinhar e ver um filme", "Um fim de semana surpresa num SPA"],
        creatorAnswer: "Um fim de semana surpresa num SPA"
      },
      {
        questionText: "Qual é o meu pequeno detalhe físico ou gesto teu que mais me apaixona?",
        options: ["O teu sorriso logo pela manhã", "A forma como me dás a mão", "O teu olhar quando estás concentrado(a)", "O teu cheiro e o teu abraço apertado"],
        creatorAnswer: "O teu cheiro e o teu abraço apertado"
      },
      {
        questionText: "Se pudéssemos congelar o tempo num momento nosso, qual seria?",
        options: ["O nosso primeiro beijo", "Uma viagem marcante que fizemos", "Um domingo preguiçoso deitados no sofá", "O dia em que decidimos namorar oficialmente"],
        creatorAnswer: "O dia em que decidimos namorar oficialmente"
      }
    ]
  },
  engracado: {
    title: "Quem é Quem no Casal? 🤪",
    questions: [
      {
        questionText: "Quem é mais provável de se perder ao usar o GPS?",
        options: ["Eu, claramente", "O meu amor", "Nenhum de nós, somos ótimos em orientação", "Ambos nos perdemos e rimos disso depois"],
        creatorAnswer: "O meu amor"
      },
      {
        questionText: "Qual é a minha reação típica quando estou com muita fome (hangry)?",
        options: ["Fico super rabugento(a) e impaciente", "Fico calado(a) e com um olhar triste", "Faço imenso drama como se fosse desmaiar", "Fico impaciente a perguntar 'já falta muito?'"],
        creatorAnswer: "Fico super rabugento(a) e impaciente"
      },
      {
        questionText: "Se fôssemos personagens num filme de terror, quem morreria primeiro?",
        options: ["Eu, por tentar ser simpático(a) com o assassino", "O meu amor, por ir investigar o barulho no sótão", "Nenhum de nós, seríamos os heróis sobreviventes", "Ambos ao mesmo tempo porque caímos a fugir"],
        creatorAnswer: "O meu amor, por ir investigar o barulho no sótão"
      },
      {
        questionText: "Quem demora mais tempo a arranjar-se para sair de casa?",
        options: ["Eu, sem dúvida!", "O meu amor, com toda a certeza", "Ambos demoramos imenso", "Nenhum de nós, estamos prontos em 5 minutos"],
        creatorAnswer: "O meu amor, com toda a certeza"
      },
      {
        questionText: "Quem gasta mais dinheiro em compras por impulso?",
        options: ["Eu, com mimos ou tecnologia", "O meu amor, em comida ou roupa", "Ambos competimos para ver quem gasta mais", "Nenhum de nós, somos muito poupados"],
        creatorAnswer: "O meu amor, em comida ou roupa"
      }
    ]
  },
  futuro: {
    title: "Visão de Futuro do Casal 🔮",
    questions: [
      {
        questionText: "Como imaginas a nossa casa de sonho no futuro?",
        options: ["Um apartamento moderno no centro da cidade", "Uma casa acolhedora no campo com jardim", "Uma vivenda junto à praia", "Uma quinta cheia de animais"],
        creatorAnswer: "Uma casa acolhedora no campo com jardim"
      },
      {
        questionText: "Se pudéssemos viver num país estrangeiro por um ano, qual escolherias?",
        options: ["Japão", "Itália", "Austrália", "Estados Unidos"],
        creatorAnswer: "Itália"
      },
      {
        questionText: "Quantos animais de estimação gostarias de ter no futuro?",
        options: ["Nenhum, prefiro liberdade", "Apenas 1 (um cão ou gato)", "2 animais para fazerem companhia um ao outro", "Uma autêntica mini-quinta com 3 ou mais"],
        creatorAnswer: "2 animais para fazerem companhia um ao outro"
      },
      {
        questionText: "Qual é o grande objetivo de vida que mais queres conquistar comigo?",
        options: ["Comprar a nossa própria casa", "Viajar pelo mundo juntos", "Construir uma família feliz", "Criar um projeto ou negócio em comum"],
        creatorAnswer: "Comprar a nossa própria casa"
      },
      {
        questionText: "Como nos imaginas daqui a 30 anos?",
        options: ["Ainda a namorar como adolescentes e a viajar", "Sentados num alpendre a rir de memórias", "Super focados no trabalho e sucesso", "Rodeados de família e netos"],
        creatorAnswer: "Ainda a namorar como adolescentes e a viajar"
      }
    ]
  },
  geral: {
    title: "Quiz Geral de Afinidade 🧠",
    questions: [
      {
        questionText: "Qual é o meu sabor de gelado favorito?",
        options: ["Chocolate / Nutella", "Morango / Frutos Vermelhos", "Limão / Manga", "Baunilha / Caramelo"],
        creatorAnswer: "Chocolate / Nutella"
      },
      {
        questionText: "Se eu pudesse comer apenas uma refeição para o resto da vida, o que seria?",
        options: ["Pizza / Massa (Italiano)", "Sushi / Comida Asiática", "Hambúrgueres / Batatas fritas", "Comida caseira tradicional"],
        creatorAnswer: "Pizza / Massa (Italiano)"
      },
      {
        questionText: "Qual é a minha estação do ano favorita?",
        options: ["Verão (praia e calor)", "Primavera (flores e dias amenos)", "Outono (folhas caídas e aconchego)", "Inverno (frio, lareira e mantas)"],
        creatorAnswer: "Verão (praia e calor)"
      },
      {
        questionText: "Qual é a minha atividade favorita para um domingo à tarde?",
        options: ["Ir dar um passeio ao parque ou à praia", "Ficar no sofá a maratonar séries", "Ir ao cinema ou centro comercial", "Fazer desporto ou atividade física"],
        creatorAnswer: "Ficar no sofá a maratonar séries"
      },
      {
        questionText: "O que é que mais me faz rir ou alegra um dia mau?",
        options: ["Um abraço apertado teu em silêncio", "Uma piada parva ou careta tua", "Comer um doce ou o meu prato favorito", "Sair de casa para distrair a cabeça"],
        creatorAnswer: "Uma piada parva ou careta tua"
      }
    ]
  }
};

const enTemplates = {
  romantico: {
    title: "Our Love & Romance 💖",
    questions: [
      {
        questionText: "What would be my dream vacation with you?",
        options: ["Paris, the city of love", "A cozy secluded cabin in the snow", "A tropical beach in the Maldives", "An adventurous road trip"],
        creatorAnswer: "A tropical beach in the Maldives"
      },
      {
        questionText: "What do I value most in our relationship?",
        options: ["Our deep connection and long talks", "Hugs and physical affection", "Supporting each other through hard times", "Laughing together until our stomachs hurt"],
        creatorAnswer: "Our deep connection and long talks"
      },
      {
        questionText: "Where would my ideal anniversary date take place?",
        options: ["A candlelit dinner at a fancy restaurant", "A sunset picnic in the park", "Staying in to cook and watch a movie", "A surprise weekend at a spa"],
        creatorAnswer: "A surprise weekend at a spa"
      },
      {
        questionText: "Which of your physical traits or gestures makes me fall in love the most?",
        options: ["Your smile first thing in the morning", "The way you hold my hand", "Your look when you are focused", "Your scent and tight hugs"],
        creatorAnswer: "Your scent and tight hugs"
      },
      {
        questionText: "If we could freeze time in one of our moments, which would it be?",
        options: ["Our first kiss", "A special trip we took together", "A lazy Sunday cuddling on the couch", "The day we officially decided to be together"],
        creatorAnswer: "The day we officially decided to be together"
      }
    ]
  },
  engracado: {
    title: "Who's Who in the Relationship? 🤪",
    questions: [
      {
        questionText: "Who is most likely to get lost while using GPS?",
        options: ["Me, definitely", "My love", "Neither, we are great at directions", "We both get lost and laugh about it"],
        creatorAnswer: "My love"
      },
      {
        questionText: "What is my typical reaction when I'm hangry?",
        options: ["I get super grumpy and impatient", "I get quiet and sad", "I make a huge drama as if I'm fainting", "I keep asking 'is it ready yet?'"],
        creatorAnswer: "I get super grumpy and impatient"
      },
      {
        questionText: "If we were in a horror movie, who would die first?",
        options: ["Me, trying to be friendly to the killer", "My love, going to check that noise in the attic", "Neither, we'd be the surviving heroes", "Both of us tripping while running away"],
        creatorAnswer: "My love, going to check that noise in the attic"
      },
      {
        questionText: "Who takes longer to get ready to leave the house?",
        options: ["Me, without a doubt!", "My love, for sure", "We both take forever", "Neither, we are ready in 5 minutes"],
        creatorAnswer: "My love, for sure"
      },
      {
        questionText: "Who spends more money on impulse purchases?",
        options: ["Me, on treats or tech", "My love, on food or clothes", "We both compete on who spends more", "Neither, we are very saving-oriented"],
        creatorAnswer: "My love, on food or clothes"
      }
    ]
  },
  futuro: {
    title: "Our Vision of the Future 🔮",
    questions: [
      {
        questionText: "How do you imagine our dream house in the future?",
        options: ["A modern apartment in the city center", "A cozy house in the countryside with a garden", "A villa next to the beach", "A farm full of animals"],
        creatorAnswer: "A cozy house in the countryside with a garden"
      },
      {
        questionText: "If we could live abroad for a year, where would you choose?",
        options: ["Japan", "Italy", "Australia", "United States"],
        creatorAnswer: "Italy"
      },
      {
        questionText: "How many pets would you like to have in the future?",
        options: ["None, I prefer freedom", "Just 1 (a dog or cat)", "2 pets to keep each other company", "A mini-farm with 3 or more"],
        creatorAnswer: "2 pets to keep each other company"
      },
      {
        questionText: "What life goal do you want to achieve with me the most?",
        options: ["Buying our own house", "Traveling the world together", "Building a happy family", "Starting a business together"],
        creatorAnswer: "Buying our own house"
      },
      {
        questionText: "How do you see us in 30 years?",
        options: ["Still dating like teenagers and traveling", "Sitting on a porch laughing at memories", "Super focused on work and success", "Surrounded by family and grandkids"],
        creatorAnswer: "Still dating like teenagers and traveling"
      }
    ]
  },
  geral: {
    title: "General Affinity Quiz 🧠",
    questions: [
      {
        questionText: "What is my favorite ice cream flavor?",
        options: ["Chocolate / Nutella", "Strawberry / Red Fruits", "Lemon / Manga", "Vanilla / Caramel"],
        creatorAnswer: "Chocolate / Nutella"
      },
      {
        questionText: "If I could eat only one meal for the rest of my life, what would it be?",
        options: ["Pizza / Pasta (Italian)", "Sushi / Asian Food", "Burgers / Fries", "Traditional homemade food"],
        creatorAnswer: "Pizza / Pasta (Italian)"
      },
      {
        questionText: "What is my favorite season?",
        options: ["Summer (beach and sun)", "Spring (flowers and warm days)", "Autumn (leaves and coziness)", "Winter (cold, fireplace and blankets)"],
        creatorAnswer: "Summer (beach and sun)"
      },
      {
        questionText: "What is my favorite Sunday afternoon activity?",
        options: ["Going for a walk in the park or beach", "Staying on the couch binge-watching series", "Going to the cinema or mall", "Doing sports or physical activity"],
        creatorAnswer: "Staying on the couch binge-watching series"
      },
      {
        questionText: "What makes me laugh or cheers me up on a bad day?",
        options: ["A tight silent hug from you", "A silly joke or funny face you make", "Eating a sweet or my favorite dish", "Leaving the house to clear my head"],
        creatorAnswer: "A silly joke or funny face you make"
      }
    ]
  }
};

module.exports = { ptTemplates, enTemplates };
