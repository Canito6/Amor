import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../context/PreferencesContext';
import { useToast } from '../../../context/ToastContext';
import { translations } from '../../../services/common/translations';
import { authService } from '../../../services/auth/authService';
import LoveCounter from '../../../components/dashboard/widgets/LoveCounter';
import ProfileCards from '../../../components/perfil/ProfileCards';
import ProfileStats from '../../../components/perfil/ProfileStats';
import { usePushNotifications } from '../../../hooks/usePushNotifications';
import './PerfilCasal.css';

export default function PerfilCasal() {
  const navigate = useNavigate();
  const { language } = usePreferences();
  const { showToast } = useToast();
  const t = translations[language];
  const meuNome = localStorage.getItem('nome') || '';

  const [coupleInfo, setCoupleInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [infoData, statsData] = await Promise.all([
        authService.getCoupleInfo(),
        authService.getCoupleStats()
      ]);
      setCoupleInfo(infoData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar dados do perfil:', err);
      setError(language === 'pt' ? 'Erro ao carregar os dados do casal.' : 'Error loading couple data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    loadData();

    // Ouvir atualizações de outros componentes
    const handleRefresh = () => {
      loadData();
    };
    window.addEventListener('refreshCoupleInfo', handleRefresh);
    return () => {
      window.removeEventListener('refreshCoupleInfo', handleRefresh);
    };
  }, [navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(language === 'pt' ? 'A imagem é muito grande! Escolhe uma até 5MB.' : 'The image is too large! Choose one up to 5MB.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      await authService.uploadAvatar(formData);
      
      // Notificar o MainLayout para atualizar a topbar/sidebar
      window.dispatchEvent(new Event('refreshCoupleInfo'));
      
      // Recarregar os dados locais
      await loadData();
    } catch (err) {
      showToast(err.message || (t.profile_avatar_error || 'Erro ao carregar avatar.'), 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading && !coupleInfo) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const partners = coupleInfo?.partners || [];
  const me = partners.find(p => p.username === meuNome) || { username: meuNome, avatarUrl: '', moodEmoji: '' };
  const partner = partners.find(p => p.username !== meuNome) || { username: 'Amor', avatarUrl: '', moodEmoji: '' };

  return (
    <div className="app-container fade-in profile-casal-page">
      {/* Cabeçalho */}
      <div className="page-header-row">
        <button className="btn btn-dark btn-back" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="page-title">{t.profile_title || 'Perfil do Casal & Estatísticas 💖'}</h1>
        <div className="page-header-spacer"></div>
      </div>

      {error && (
        <div className="profile-error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Love Counter Widget */}
      {coupleInfo?.relationshipDate && (
        <div className="profile-counter-section">
          <LoveCounter 
            relationshipDate={coupleInfo.relationshipDate} 
            language={language} 
            t={t} 
          />
        </div>
      )}

      {/* Cartões dos Perfis */}
      <ProfileCards 
        me={me}
        partner={partner}
        language={language}
        uploading={uploading}
        handleAvatarChange={handleAvatarChange}
        t={t}
      />

      {/* Estatísticas do Casal */}
      {stats && (
        <ProfileStats 
          stats={stats}
          language={language}
          t={t}
        />
      )}

      {/* Notificações Push Web */}
      <PushNotificationControl language={language} />
    </div>
  );
}

function PushNotificationControl({ language }) {
  const { isSupported, isSubscribed, loading, subscribeToPush, unsubscribeFromPush } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <div className="glass-panel profile-push-section" style={{ marginTop: '20px', padding: '20px', textAlign: 'center' }}>
      <h3>🔔 {language === 'pt' ? 'Notificações Push Web' : 'Web Push Notifications'}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>
        {language === 'pt' 
          ? 'Recebe alertas instantâneos no teu telemóvel quando o teu amor enviar mensagens ou surpresas!' 
          : 'Receive instant alerts on your phone when your love sends messages or surprises!'}
      </p>
      {isSubscribed ? (
        <button 
          className="btn btn-secondary" 
          disabled={loading}
          onClick={unsubscribeFromPush}
        >
          {loading ? '...' : (language === 'pt' ? '🔕 Desativar Notificações' : '🔕 Disable Notifications')}
        </button>
      ) : (
        <button 
          className="btn btn-primary" 
          disabled={loading}
          onClick={subscribeToPush}
        >
          {loading ? '...' : (language === 'pt' ? '🔔 Ativar Notificações no Telemóvel' : '🔔 Enable Phone Notifications')}
        </button>
      )}
    </div>
  );
}
