import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecuperarPassword from './pages/RecuperarPassword';
import Registar from './pages/Registar';
import AdminDashboard from './pages/AdminDashboard';
import ForcarMudancaPassword from './pages/ForcarMudancaPassword';
import Mensagens from './pages/Mensagens';
import Fotos from './pages/Fotos';
import Memorias from './pages/Memorias';
import Quizzes from './pages/Quizzes';
import Calendario from './pages/Calendario';
import CustomTabViewer from './pages/CustomTabViewer';

function App() {
  return (
    <PreferencesProvider>
      <BrowserRouter>
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
            <Route path="/tab/:tabId" element={<CustomTabViewer />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PreferencesProvider>
  );
}

export default App;