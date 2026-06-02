import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { authService } from '../services/authService';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import EventCountdown from '../components/dashboard/EventCountdown';
import NavigationCards from '../components/dashboard/NavigationCards';
import SpotifyWidget from '../components/dashboard/SpotifyWidget';
import MoodTracker from '../components/dashboard/MoodTracker';
import LoveCounter from '../components/dashboard/LoveCounter';
import CoupleEditModal from '../components/dashboard/CoupleEditModal';
import './Dashboard.css';

export default function Dashboard() {
  const [nome, setNome] = useState('');
  const [nextEvent, setNextEvent] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const navigate = useNavigate();

  const { language, layoutStyle, customTabs } = usePreferences();
  const t = translations[language];

  // Couple States
  const [coupleInfo, setCoupleInfo] = useState({
    coupleId: '',
    names: '',
    partnerNames: [],
    relationshipDate: null,
    spotifyPlaylist: ''
  });

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editNames, setEditNames] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSpotify, setEditSpotify] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const loadCoupleInfo = async () => {
    try {
      const info = await authService.getCoupleInfo();
      setCoupleInfo(info);
      if (info.names) {
        setNome(info.names);
      } else if (info.partnerNames && info.partnerNames.length > 0) {
        setNome(info.partnerNames.join(' & '));
      } else {
        setNome(localStorage.getItem('nome') || 'Amor');
      }

      // Prepopulate edit fields
      setEditNames(info.names || '');
      setEditSpotify(info.spotifyPlaylist || '');
      if (info.relationshipDate) {
        const d = new Date(info.relationshipDate);
        // Format as YYYY-MM-DD
        const formattedDate = d.toISOString().split('T')[0];
        setEditDate(formattedDate);
      }
    } catch (err) {
      console.error('Erro ao carregar informações de casal:', err);
      setNome(localStorage.getItem('nome') || 'Amor');
    }
  };

  const carregarProximoEvento = async () => {
    try {
      const events = await eventService.getEvents();
      if (events.length > 0) {
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        const futuros = events.filter(e => new Date(e.date).setHours(0,0,0,0) >= hoje.getTime());
        if (futuros.length > 0) {
          const ordenados = futuros.sort((a, b) => new Date(a.date) - new Date(b.date));
          const proximo = ordenados[0];
          setNextEvent(proximo);

          const dataEvt = new Date(proximo.date);
          dataEvt.setHours(0,0,0,0);
          const diferencaMs = dataEvt.getTime() - hoje.getTime();
          const dias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
          setDaysRemaining(dias);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar próximo evento:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      loadCoupleInfo();
      carregarProximoEvento();
    }

    const handleRefresh = () => {
      loadCoupleInfo();
    };
    window.addEventListener('refreshCoupleInfo', handleRefresh);
    return () => {
      window.removeEventListener('refreshCoupleInfo', handleRefresh);
    };
  }, [navigate]);

  const terminarSessao = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleUpdateCoupleInfo = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    try {
      const data = {
        names: editNames.trim(),
        relationshipDate: editDate ? new Date(editDate) : null,
        spotifyPlaylist: editSpotify.trim()
      };

      const updated = await authService.updateCoupleInfo(data);
      setCoupleInfo(updated);
      if (updated.names) {
        setNome(updated.names);
      } else if (updated.partnerNames && updated.partnerNames.length > 0) {
        setNome(updated.partnerNames.join(' & '));
      }

      // Dispatch event to update topbar names
      window.dispatchEvent(new Event('refreshCoupleInfo'));

      setEditSuccess('Informações atualizadas com sucesso! ❤️');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess('');
      }, 1500);
    } catch (err) {
      setEditError(err.message || 'Erro ao guardar definições.');
    }
  };

  return (
    <div className="app-container fade-in" style={{ textAlign: 'center', maxWidth: '850px', paddingTop: '20px' }}>
      
      {/* Botão de Edição do Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <button 
          className="btn-edit-dashboard"
          onClick={() => setIsEditModalOpen(true)}
        >
          ✏️ {t.edit_couple_info || 'Editar Casal'}
        </button>
      </div>

      {/* Mensagem de Boas-Vindas */}
      <WelcomeBanner nome={nome} t={t} />

      {/* Diário de Humor (Mood Tracker) */}
      <MoodTracker 
        coupleInfo={coupleInfo} 
        loadCoupleInfo={loadCoupleInfo} 
        t={t} 
        language={language} 
      />

      {/* Contador do Amor */}
      <LoveCounter 
        relationshipDate={coupleInfo.relationshipDate} 
        language={language} 
        t={t} 
      />

      {/* Widget de Contagem Decrescente */}
      <EventCountdown 
        nextEvent={nextEvent} 
        daysRemaining={daysRemaining} 
        language={language} 
        t={t} 
      />

      {/* LAYOUT DE CARTÕES (Apenas quando layoutStyle === 'stacked') */}
      <NavigationCards 
        layoutStyle={layoutStyle} 
        customTabs={customTabs} 
        t={t} 
        language={language} 
      />

      {/* Widget do Spotify com playlist dinâmica */}
      <SpotifyWidget t={t} playlistUrl={coupleInfo.spotifyPlaylist} />

      {/* Área dos botões de rodapé */}
      <div style={{ marginTop: '35px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        {layoutStyle === 'stacked' && (
          <button 
            onClick={terminarSessao}
            className="btn btn-dark"
            style={{ padding: '10px 20px', fontSize: '14px' }}
          >
            {t.logout}
          </button>
        )}
      </div>

      {/* Modal de Edição de Informações de Casal */}
      <CoupleEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateCoupleInfo}
        editNames={editNames}
        setEditNames={setEditNames}
        editDate={editDate}
        setEditDate={setEditDate}
        editSpotify={editSpotify}
        setEditSpotify={setEditSpotify}
        editError={editError}
        editSuccess={editSuccess}
        t={t}
      />
    </div>
  );
}