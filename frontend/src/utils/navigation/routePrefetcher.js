// Mapa de imports dinâmicos de rotas para pré-carregamento (Prefetching)
export const routeImports = {
  '/dashboard': () => import('../../pages/couple/dashboard/Dashboard'),
  '/recuperar': () => import('../../pages/auth/RecuperarPassword'),
  '/admin': () => import('../../pages/auth/AdminDashboard'),
  '/forcar-password': () => import('../../pages/auth/ForcarMudancaPassword'),
  '/mensagens': () => import('../../pages/chat/Mensagens'),
  '/fotos': () => import('../../pages/gallery/Fotos'),
  '/memorias': () => import('../../pages/fun/memorias/Memorias'),
  '/quizzes': () => import('../../pages/fun/quizzes/Quizzes'),
  '/calendario': () => import('../../pages/couple/calendario/Calendario'),
  '/ciclo': () => import('../../pages/cycle/CycleCalendar'),
  '/tab-viewer': () => import('../../pages/couple/custom-tab/CustomTabViewer'),
  '/raspadinhas': () => import('../../pages/fun/raspadinhas/Raspadinhas'),
  '/roleta': () => import('../../pages/fun/roleta/Roleta'),
  '/bucket-list': () => import('../../pages/fun/bucket-list/BucketList'),
  '/vales': () => import('../../pages/fun/vales/Vales'),
  '/cartas': () => import('../../pages/fun/cartas/Cartas'),
  '/frasco': () => import('../../pages/fun/frasco/Frasco'),
  '/likely': () => import('../../pages/fun/likely/Likely'),
  '/jogos': () => import('../../pages/fun/jogos/Jogos'),
  '/mimos': () => import('../../pages/fun/mimos/Mimos'),
  '/jogos/tic-tac-toe': () => import('../../pages/fun/jogos/TicTacToe'),
  '/jogos/memoria': () => import('../../pages/fun/jogos/JogoMemoria'),
  '/jogos/4-em-linha': () => import('../../pages/fun/jogos/ConnectFour'),
  '/jogos/verdade-ou-consequencia': () => import('../../pages/fun/jogos/TruthOrDare'),
  '/perfil-casal': () => import('../../pages/couple/perfil/PerfilCasal'),
  '/desenho': () => import('../../pages/fun/desenho/Desenho'),
  '/timeline': () => import('../../pages/couple/timeline/Timeline'),
  '/date-night': () => import('../../pages/fun/date-night/DateNight'),
  '/estatisticas': () => import('../../pages/couple/stats/RelationshipStats'),
  '/definicoes': () => import('../../pages/couple/definicoes/Definicoes'),
};

const prefetchedRoutesSet = new Set();

export const prefetchRoute = (path) => {
  if (!path || prefetchedRoutesSet.has(path)) return;
  const routeLoader = routeImports[path];
  if (routeLoader) {
    prefetchedRoutesSet.add(path);
    routeLoader().catch(() => {
      prefetchedRoutesSet.delete(path);
    });
  }
};
