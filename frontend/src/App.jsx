import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RecuperarPassword from './pages/RecuperarPassword';
import Registar from './pages/Registar'; // <-- Importamos a página nova

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/registar" element={<Registar />} /> {/* <-- Adicionamos a rota nova */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;