import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading page components
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RecuperarPassword = lazy(() => import('./pages/RecuperarPassword'));
const Registar = lazy(() => import('./pages/Registar'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ForcarMudancaPassword = lazy(() => import('./pages/ForcarMudancaPassword'));
const Mensagens = lazy(() => import('./pages/Mensagens'));
const Fotos = lazy(() => import('./pages/Fotos'));
const Memorias = lazy(() => import('./pages/Memorias'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const Calendario = lazy(() => import('./pages/Calendario'));
const CustomTabViewer = lazy(() => import('./pages/CustomTabViewer'));
const Raspadinhas = lazy(() => import('./pages/Raspadinhas'));

// Fallback loader component
function LoadingFallback() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/recuperar" element={<RecuperarPassword />} />
            <Route path="/registar" element={<Registar />} />
            <Route path="/forcar-password" element={<ForcarMudancaPassword />} />
            
            {/* Rotas Autenticadas protegidas pelo MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/mensagens" element={<Mensagens />} />
              <Route path="/fotos" element={<Fotos />} />
              <Route path="/memorias" element={<Memorias />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/raspadinhas" element={<Raspadinhas />} />
              <Route path="/tab/:tabId" element={<CustomTabViewer />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;