import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/auth/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Páginas de autenticação principais de acesso imediato (sem lazy para animações fluida desde o 1º clique)
import Login from '../pages/auth/Login';
import Registar from '../pages/auth/Registar';

// Páginas de acesso pós-autenticação imediato
import Dashboard from '../pages/couple/dashboard/Dashboard';

// Carregamento dinâmico (Code-Splitting) para páginas secundárias
const RecuperarPassword = lazy(() => import('../pages/auth/RecuperarPassword'));
const AdminDashboard = lazy(() => import('../pages/auth/AdminDashboard'));
const ForcarMudancaPassword = lazy(() => import('../pages/auth/ForcarMudancaPassword'));
const Mensagens = lazy(() => import('../pages/chat/Mensagens'));
const Fotos = lazy(() => import('../pages/gallery/Fotos'));
const Memorias = lazy(() => import('../pages/fun/memorias/Memorias'));
const Quizzes = lazy(() => import('../pages/fun/quizzes/Quizzes'));
const Calendario = lazy(() => import('../pages/couple/calendario/Calendario'));
const CycleCalendar = lazy(() => import('../pages/cycle/CycleCalendar'));
const CustomTabViewer = lazy(() => import('../pages/couple/custom-tab/CustomTabViewer'));
const Raspadinhas = lazy(() => import('../pages/fun/raspadinhas/Raspadinhas'));
const Roleta = lazy(() => import('../pages/fun/roleta/Roleta'));
const BucketList = lazy(() => import('../pages/fun/bucket-list/BucketList'));
const Vales = lazy(() => import('../pages/fun/vales/Vales'));
const Cartas = lazy(() => import('../pages/fun/cartas/Cartas'));
const Frasco = lazy(() => import('../pages/fun/frasco/Frasco'));
const Likely = lazy(() => import('../pages/fun/likely/Likely'));
const Jogos = lazy(() => import('../pages/fun/jogos/Jogos'));
const PerfilCasal = lazy(() => import('../pages/couple/perfil/PerfilCasal'));
const Desenho = lazy(() => import('../pages/fun/desenho/Desenho'));
const Timeline = lazy(() => import('../pages/couple/timeline/Timeline'));
const DateNight = lazy(() => import('../pages/fun/date-night/DateNight'));
const RelationshipStats = lazy(() => import('../pages/couple/stats/RelationshipStats'));
const Definicoes = lazy(() => import('../pages/couple/definicoes/Definicoes'));

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
