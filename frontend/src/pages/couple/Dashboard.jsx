import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/couple/eventService';
import { authService } from '../../services/auth/authService';
import { usePreferences } from '../../context/PreferencesContext';
import { useTabs } from '../../context/TabContext';
import { translations } from '../../services/common/translations';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import EventCountdown from '../../components/dashboard/EventCountdown';
import NavigationCards from '../../components/dashboard/NavigationCards';
import SpotifyWidget from '../../components/dashboard/SpotifyWidget';
import MoodTracker from '../../components/dashboard/MoodTracker';
import DailyCheckIn from '../../components/dashboard/DailyCheckIn';
import LoveCounter from '../../components/dashboard/LoveCounter';
import CoupleEditModal from '../../components/dashboard/CoupleEditModal';
import './Dashboard.css';

// Default widget configuration
const DEFAULT_WIDGETS = [
  { id: 'welcome',    visible: true, size: 'stretched' },
  { id: 'mood',       visible: true, size: 'stretched' },
  { id: 'checkin',    visible: true, size: 'stretched' },
  { id: 'love',       visible: true, size: 'stretched' },
  { id: 'countdown',  visible: true, size: 'stretched' },
  { id: 'navigation', visible: true, size: 'stretched' },
  { id: 'spotify',    visible: true, size: 'stretched' },
];



export default function Dashboard() {
  const [nome, setNome] = useState('');
  const [nextEvent, setNextEvent] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const navigate = useNavigate();

  const { language, layoutStyle } = usePreferences();
  const { customTabs } = useTabs();
  const t = translations[language];

  const widgets = DEFAULT_WIDGETS;

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

      if (info.coupleId) {
        const oldCoupleId = localStorage.getItem('coupleId');
        if (oldCoupleId !== info.coupleId) {
          localStorage.setItem('coupleId', info.coupleId);
          window.dispatchEvent(new Event('authChange'));
        }
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
    authService.logout().catch(err => console.error('Erro ao terminar sessão no backend:', err));
    localStorage.clear();
    window.dispatchEvent(new Event('authChange'));
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



  // Render a widget by its id
  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'welcome':
        return <WelcomeBanner nome={nome} t={t} />;
      case 'mood':
        return (
          <MoodTracker 
            coupleInfo={coupleInfo} 
            loadCoupleInfo={loadCoupleInfo} 
            t={t} 
            language={language} 
          />
        );
      case 'checkin':
        return <DailyCheckIn t={t} language={language} />;
      case 'love':
        return (
          <LoveCounter 
            relationshipDate={coupleInfo.relationshipDate} 
            language={language} 
            t={t} 
          />
        );
      case 'countdown':
        return (
          <EventCountdown 
            nextEvent={nextEvent} 
            daysRemaining={daysRemaining} 
            language={language} 
            t={t} 
          />
        );
      case 'navigation':
        return (
          <NavigationCards 
            layoutStyle={layoutStyle} 
            customTabs={customTabs} 
            t={t} 
            language={language} 
          />
        );
      case 'spotify':
        return <SpotifyWidget t={t} playlistUrl={coupleInfo.spotifyPlaylist} />;
      default:
        return null;
    }
  };



  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <div className="app-container fade-in" style={{ textAlign: 'center', maxWidth: '850px', paddingTop: '20px' }}>
      
      {/* Botão de Edição do Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', gap: '10px' }}>
        <button 
          className="btn-edit-dashboard"
          onClick={() => setIsEditModalOpen(true)}
        >
          ✏️ {t.edit_couple_info || 'Editar Casal'}
        </button>
      </div>

      {/* Widget Grid */}
      <div className="widget-grid">
        {visibleWidgets.map((widget) => (
          <div key={widget.id} className={`widget-slot widget-size-${widget.size}`}>
            <div className="widget-content">
              {renderWidget(widget.id)}
            </div>
          </div>
        ))}
      </div>



      {/* ATALHOS RÁPIDOS (Apenas quando layoutStyle === 'sidebar' no Desktop) */}
      {layoutStyle === 'sidebar' && (
        <div className="dashboard-quick-links glass-panel fade-in">
          <button className="quick-link-btn" onClick={() => navigate('/mensagens')} style={{ '--btn-accent': '#ff4d6d' }}>
            <span className="quick-link-icon">💌</span>
            <span className="quick-link-label">{t.messages}</span>
          </button>
          <button className="quick-link-btn" onClick={() => navigate('/fotos')} style={{ '--btn-accent': '#ff9f1c' }}>
            <span className="quick-link-icon">📸</span>
            <span className="quick-link-label">{t.photos}</span>
          </button>
          <button className="quick-link-btn" onClick={() => navigate('/memorias')} style={{ '--btn-accent': '#7209b7' }}>
            <span className="quick-link-icon">⏳</span>
            <span className="quick-link-label">{t.memories}</span>
          </button>
          <button className="quick-link-btn" onClick={() => navigate('/jogos')} style={{ '--btn-accent': '#2a9d8f' }}>
            <span className="quick-link-icon">🎮</span>
            <span className="quick-link-label">{t.games_title ? t.games_title.replace(' 🎮', '') : (language === 'pt' ? 'Jogos' : 'Games')}</span>
          </button>
          <button className="quick-link-btn" onClick={() => navigate('/calendario')} style={{ '--btn-accent': '#00bbf9' }}>
            <span className="quick-link-icon">📅</span>
            <span className="quick-link-label">{t.calendar}</span>
          </button>
        </div>
      )}

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