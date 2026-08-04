import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/auth/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Páginas de autenticação principais de acesso imediato (sem lazy para animações fluida desde o 1º clique)
import Login from '../pages/auth/Login';
import Registar from '../pages/auth/Registar';

// Utilitário de resiliência: se o descarregamento do chunk falhar (ex: novo deploy ou perda momentânea de rede), recarrega a página automaticamente
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageAlreadyRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-refreshed') || 'false'
    );
    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageAlreadyRefreshed) {
        window.sessionStorage.setItem('page-has-been-refreshed', 'true');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });
}

import { routeImports } from '../utils/navigation/routePrefetcher';

// Carregamento dinâmico otimizado (Code-Splitting + Resiliência) para páginas pós-login
const Dashboard = lazyWithRetry(routeImports['/dashboard']);
const RecuperarPassword = lazyWithRetry(routeImports['/recuperar']);
const AdminDashboard = lazyWithRetry(routeImports['/admin']);
const ForcarMudancaPassword = lazyWithRetry(routeImports['/forcar-password']);
const Mensagens = lazyWithRetry(routeImports['/mensagens']);
const Fotos = lazyWithRetry(routeImports['/fotos']);
const Memorias = lazyWithRetry(routeImports['/memorias']);
const Quizzes = lazyWithRetry(routeImports['/quizzes']);
const Calendario = lazyWithRetry(routeImports['/calendario']);
const CycleCalendar = lazyWithRetry(routeImports['/ciclo']);
const CustomTabViewer = lazyWithRetry(routeImports['/tab-viewer']);
const Raspadinhas = lazyWithRetry(routeImports['/raspadinhas']);
const Roleta = lazyWithRetry(routeImports['/roleta']);
const BucketList = lazyWithRetry(routeImports['/bucket-list']);
const Vales = lazyWithRetry(routeImports['/vales']);
const Cartas = lazyWithRetry(routeImports['/cartas']);
const Frasco = lazyWithRetry(routeImports['/frasco']);
const Likely = lazyWithRetry(routeImports['/likely']);
const Jogos = lazyWithRetry(routeImports['/jogos']);
const Mimos = lazyWithRetry(routeImports['/mimos']);
const TicTacToe = lazyWithRetry(routeImports['/jogos/tic-tac-toe']);
const JogoMemoria = lazyWithRetry(routeImports['/jogos/memoria']);
const ConnectFour = lazyWithRetry(routeImports['/jogos/4-em-linha']);
const TruthOrDare = lazyWithRetry(routeImports['/jogos/verdade-ou-consequencia']);
const Battleship = lazyWithRetry(routeImports['/jogos/batalha-naval']);
const PerfilCasal = lazyWithRetry(routeImports['/perfil-casal']);
const Desenho = lazyWithRetry(routeImports['/desenho']);
const Timeline = lazyWithRetry(routeImports['/timeline']);
const DateNight = lazyWithRetry(routeImports['/date-night']);
const RelationshipStats = lazyWithRetry(routeImports['/estatisticas']);
const Definicoes = lazyWithRetry(routeImports['/definicoes']);

// Componente de carregamento elegante enquanto as páginas secundárias são transferidas
function RouteFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '16px'
    }}>
      <div 
        className="pulsing-heart" 
        style={{ fontSize: '42px', animation: 'pulse 1.2s infinite ease-in-out' }}
      >
        ❤️
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Rotas de Autenticação com Transições de Animação (AuthLayout) */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/registar" element={<Registar />} />
          <Route path="/vincular" element={<Registar />} />
          <Route path="/convite" element={<Registar />} />
          <Route path="/recuperar" element={<RecuperarPassword />} />
          <Route path="/forcar-password" element={<ForcarMudancaPassword />} />
        </Route>
        
        {/* Rotas Autenticadas protegidas pelo MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mensagens" element={<Mensagens />} />
            <Route path="/fotos" element={<Fotos />} />
            <Route path="/memorias" element={<Memorias />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/ciclo" element={<CycleCalendar />} />
            <Route path="/raspadinhas" element={<Raspadinhas />} />
            <Route path="/roleta" element={<Roleta />} />
            <Route path="/bucket-list" element={<BucketList />} />
            <Route path="/vales" element={<Vales />} />
            <Route path="/cartas" element={<Cartas />} />
            <Route path="/frasco" element={<Frasco />} />
            <Route path="/likely" element={<Likely />} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/mimos" element={<Mimos />} />
            <Route path="/jogos/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/jogos/memoria" element={<JogoMemoria />} />
            <Route path="/jogos/4-em-linha" element={<ConnectFour />} />
            <Route path="/jogos/verdade-ou-consequencia" element={<TruthOrDare />} />
            <Route path="/jogos/batalha-naval" element={<Battleship />} />
            <Route path="/date-night" element={<DateNight />} />
            <Route path="/perfil-casal" element={<PerfilCasal />} />
            <Route path="/desenho" element={<Desenho />} />
            <Route path="/estatisticas" element={<RelationshipStats />} />
            <Route path="/definicoes" element={<Definicoes />} />
            <Route path="/tab/:tabId" element={<CustomTabViewer />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
