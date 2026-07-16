export function calculateLevelAndXP(stats) {
  let xp = 0;
  if (stats) {
    xp += (stats.quizzes?.completed || 0) * 50;
    xp += (stats.scratchCards?.scratched || 0) * 40;
    xp += (stats.bucketList?.completed || 0) * 100;
    xp += (stats.memoriesCount || 0) * 30;
    xp += (stats.photosCount || 0) * 20;
    xp += (stats.couponsCount || 0) * 30;
    xp += (stats.likely?.matched || 0) * 25;
    
    // New XP weights
    xp += (stats.messagesCount || 0) * 1;
    xp += (stats.timeCapsulesCount || 0) * 40;
    xp += (stats.decisionWheelsCount || 0) * 30;
  }

  const xpPerLevel = 250;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentLevelXP = xp % xpPerLevel;
  const progressPercent = Math.min((currentLevelXP / xpPerLevel) * 100, 100);

  return {
    xp,
    xpPerLevel,
    level,
    currentLevelXP,
    progressPercent
  };
}

export function getAchievementsList(stats, language) {
  return [
    {
      id: 'first_step',
      title: language === 'pt' ? 'Primeiro Passo' : 'First Step',
      desc: language === 'pt' ? 'Criaram a vossa primeira memória conjunta' : 'Created your first shared memory',
      unlocked: (stats?.memoriesCount || 0) >= 1,
      icon: '⏳'
    },
    {
      id: 'golden_couple',
      title: language === 'pt' ? 'Par de Ouro' : 'Golden Couple',
      desc: language === 'pt' ? 'Carregaram mais de 5 fotos na galeria' : 'Uploaded more than 5 photos',
      unlocked: (stats?.photosCount || 0) >= 5,
      icon: '📸'
    },
    {
      id: 'quiz_masters',
      title: language === 'pt' ? 'Quiz Masters' : 'Quiz Masters',
      desc: language === 'pt' ? 'Responderam a pelo menos 3 quizzes do amor' : 'Completed at least 3 love quizzes',
      unlocked: (stats?.quizzes?.completed || 0) >= 3,
      icon: '🧠'
    },
    {
      id: 'explorers',
      title: language === 'pt' ? 'Exploradores' : 'Exploradores',
      desc: language === 'pt' ? 'Concluíram pelo menos 2 desejos da Bucket List' : 'Completed at least 2 Bucket List items',
      unlocked: (stats?.bucketList?.completed || 0) >= 2,
      icon: '✈️'
    },
    {
      id: 'lucky_ones',
      title: language === 'pt' ? 'Sortudos' : 'Lucky Ones',
      desc: language === 'pt' ? 'Rasparam pelo menos 3 raspadinhas' : 'Scratched at least 3 scratch cards',
      unlocked: (stats?.scratchCards?.scratched || 0) >= 3,
      icon: '🎰'
    },
    {
      id: 'first_scratch',
      title: language === 'pt' ? 'Primeira Raspadinha' : 'First Scratch',
      desc: language === 'pt' ? 'Revelaram a vossa primeira raspadinha do amor' : 'Revealed your first love scratch card',
      unlocked: (stats?.scratchCards?.scratched || 0) >= 1,
      icon: '🎫'
    },
    {
      id: 'storyteller',
      title: language === 'pt' ? 'Contador de Histórias' : 'Storyteller',
      desc: language === 'pt' ? 'Atingiram 10 memórias felizes guardadas' : 'Reached 10 happy memories saved',
      unlocked: (stats?.memoriesCount || 0) >= 10,
      icon: '📖'
    },
    {
      id: 'chatty_couple',
      title: language === 'pt' ? '100 Mensagens' : '100 Messages',
      desc: language === 'pt' ? 'Trocaram pelo menos 100 mensagens no chat' : 'Exchanged at least 100 messages in chat',
      unlocked: (stats?.messagesCount || 0) >= 100,
      icon: '💬'
    },
    {
      id: 'first_time_capsule',
      title: language === 'pt' ? 'Primeira Cápsula do Tempo' : 'First Time Capsule',
      desc: language === 'pt' ? 'Criaram a vossa primeira memória trancada' : 'Created your first locked time capsule',
      unlocked: (stats?.timeCapsulesCount || 0) >= 1,
      icon: '🔒'
    },
    {
      id: 'wheel_spinner',
      title: language === 'pt' ? 'Roda da Sorte' : 'Wheel Spinner',
      desc: language === 'pt' ? 'Criaram a vossa primeira roda de decisões' : 'Created your first decision wheel',
      unlocked: (stats?.decisionWheelsCount || 0) >= 1,
      icon: '🎡'
    }
  ];
}
