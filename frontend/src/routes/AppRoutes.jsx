import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Lazy loading page components
const Login = lazy(() => import('../pages/auth/Login'));
const Dashboard = lazy(() => import('../pages/couple/Dashboard'));
const RecuperarPassword = lazy(() => import('../pages/auth/RecuperarPassword'));
const Registar = lazy(() => import('../pages/auth/Registar'));
const AdminDashboard = lazy(() => import('../pages/auth/AdminDashboard'));
const ForcarMudancaPassword = lazy(() => import('../pages/auth/ForcarMudancaPassword'));
const Mensagens = lazy(() => import('../pages/chat/Mensagens'));
const Fotos = lazy(() => import('../pages/gallery/Fotos'));
const Memorias = lazy(() => import('../pages/fun/memorias/Memorias'));
const Quizzes = lazy(() => import('../pages/fun/quizzes/Quizzes'));
const Calendario = lazy(() => import('../pages/couple/Calendario'));
const CustomTabViewer = lazy(() => import('../pages/couple/CustomTabViewer'));
const Raspadinhas = lazy(() => import('../pages/fun/raspadinhas/Raspadinhas'));
const Roleta = lazy(() => import('../pages/fun/roleta/Roleta'));
const BucketList = lazy(() => import('../pages/fun/bucket-list/BucketList'));
const Vales = lazy(() => import('../pages/fun/vales/Vales'));
const Cartas = lazy(() => import('../pages/fun/cartas/Cartas'));
const Frasco = lazy(() => import('../pages/fun/frasco/Frasco'));
const Likely = lazy(() => import('../pages/fun/likely/Likely'));
const Jogos = lazy(() => import('../pages/fun/jogos/Jogos'));
const PerfilCasal = lazy(() => import('../pages/couple/PerfilCasal'));
const Desenho = lazy(() => import('../pages/fun/desenho/Desenho'));

// Fallback loader component
function LoadingFallback() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/registar" element={<Registar />} />
        <Route path="/forcar-password" element={<ForcarMudancaPassword />} />
        
        {/* Rotas Autenticadas protegidas pelo MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mensagens" element={<Mensagens />} />
            <Route path="/fotos" element={<Fotos />} />
            <Route path="/memorias" element={<Memorias />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/raspadinhas" element={<Raspadinhas />} />
            <Route path="/roleta" element={<Roleta />} />
            <Route path="/bucket-list" element={<BucketList />} />
            <Route path="/vales" element={<Vales />} />
            <Route path="/cartas" element={<Cartas />} />
            <Route path="/frasco" element={<Frasco />} />
            <Route path="/likely" element={<Likely />} />
             <Route path="/jogos" element={<Jogos />} />
            <Route path="/perfil-casal" element={<PerfilCasal />} />
            <Route path="/desenho" element={<Desenho />} />
            <Route path="/tab/:tabId" element={<CustomTabViewer />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
