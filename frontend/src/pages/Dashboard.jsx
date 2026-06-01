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

  // Time Together Counter State
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
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

  // Live Timer together counter
  useEffect(() => {
    if (!coupleInfo.relationshipDate) return;

    const calculateTime = () => {
      const start = new Date(coupleInfo.relationshipDate);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();

      if (diffMs < 0) {
        setTimeTogether({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const seconds = Math.floor((diffMs / 1000) % 60);
      const minutes = Math.floor((diffMs / 1000 / 60) % 60);
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [coupleInfo.relationshipDate]);

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

  const formattedRelationshipDate = coupleInfo.relationshipDate 
    ? new Date(coupleInfo.relationshipDate).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

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

      {/* Contador do Amor */}
      {coupleInfo.relationshipDate && (
        <div className="counter-widget fade-in">
          <h2 className="counter-title">
            <span>💖</span> {t.memories_counter_title || 'Contador do Amor'} <span>💖</span>
          </h2>
          <div className="counter-grid">
            <div className="counter-item">
              <span className="counter-value">{timeTogether.days}</span>
              <span className="counter-label">{language === 'en' ? 'Days' : 'Dias'}</span>
            </div>
            <div className="counter-item">
              <span className="counter-value">{String(timeTogether.hours).padStart(2, '0')}</span>
              <span className="counter-label">{language === 'en' ? 'Hours' : 'Horas'}</span>
            </div>
            <div className="counter-item">
              <span className="counter-value">{String(timeTogether.minutes).padStart(2, '0')}</span>
              <span className="counter-label">{language === 'en' ? 'Mins' : 'Minutos'}</span>
            </div>
            <div className="counter-item">
              <span className="counter-value">{String(timeTogether.seconds).padStart(2, '0')}</span>
              <span className="counter-label">{language === 'en' ? 'Secs' : 'Segundos'}</span>
            </div>
          </div>
          <p className="counter-footer">
            {language === 'en' 
              ? `Together since ${formattedRelationshipDate} ✨` 
              : `Juntos desde ${formattedRelationshipDate} ✨`}
          </p>
        </div>
      )}

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
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div 
            className="glass-panel fade-in" 
            style={{ 
              padding: '30px', 
              width: '100%', 
              maxWidth: '480px', 
              textAlign: 'left',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={{
                position: 'absolute', top: '15px', right: '15px', 
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'
              }}
              onClick={() => setIsEditModalOpen(false)}
            >
              ✕
            </button>

            <h2 style={{ color: 'var(--primary-color)', marginBottom: '20px', textAlign: 'center' }}>
              {t.edit_couple_info || 'Editar Casal'} ❤️
            </h2>

            <form onSubmit={handleUpdateCoupleInfo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label className="input-label" htmlFor="coupleNames">
                  {t.names_label || 'Nome do Casal (ex: Miguel & Maria)'}
                </label>
                <input 
                  id="coupleNames"
                  type="text"
                  placeholder="Ex: Miguel & Maria"
                  value={editNames}
                  onChange={(e) => setEditNames(e.target.value)}
                  className="input-control"
                />
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="relDate">
                  {t.relationship_date_label || 'Data de Início do Namoro'}
                </label>
                <input 
                  id="relDate"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="input-control"
                />
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="spotifyUrl">
                  {t.spotify_playlist_label || 'Link da Playlist Especial do Spotify'}
                </label>
                <input 
                  id="spotifyUrl"
                  type="text"
                  placeholder="Ex: https://open.spotify.com/playlist/..."
                  value={editSpotify}
                  onChange={(e) => setEditSpotify(e.target.value)}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {t.save || 'Guardar'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-dark" 
                  style={{ flex: 1 }}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  {t.cancel || 'Cancelar'}
                </button>
              </div>
            </form>

            {editError && (
              <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: '#ffe3e3', border: '1px solid #ffb3b3' }}>
                <p style={{ color: 'var(--danger-color)', fontSize: '13px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{editError}</p>
              </div>
            )}

            {editSuccess && (
              <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', backgroundColor: '#e6fffa', border: '1px solid #b2f5ea' }}>
                <p style={{ color: 'var(--success-color)', fontSize: '13px', fontWeight: '600', margin: 0, textAlign: 'center' }}>{editSuccess}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}