import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/registar" element={<Registar />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forcar-password" element={<ForcarMudancaPassword />} />
        <Route path="/mensagens" element={<Mensagens />} />
        <Route path="/fotos" element={<Fotos />} />
        <Route path="/memorias" element={<Memorias />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/calendario" element={<Calendario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;