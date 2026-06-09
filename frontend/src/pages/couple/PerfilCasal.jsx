import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { translations } from '../services/translations';
import { authService } from '../services/authService';
import LoveCounter from '../components/dashboard/LoveCounter';
import './PerfilCasal.css';

export default function PerfilCasal() {
  const navigate = useNavigate();
  const { language } = usePreferences();
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
      alert(language === 'pt' ? 'A imagem é muito grande! Escolhe uma até 5MB.' : 'The image is too large! Choose one up to 5MB.');
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
      alert(err.message || (t.profile_avatar_error || 'Erro ao carregar avatar.'));
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
      <div className="profile-header">
        <button className="btn btn-dark btn-back" onClick={() => navigate('/dashboard')}>
          ⬅ {t.dashboard}
        </button>
        <h1 className="profile-page-title">{t.profile_title || 'Perfil do Casal & Estatísticas 💖'}</h1>
        <div style={{ width: '80px' }}></div> {/* Spacer */}
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
      <div className="profile-cards-container">
        {/* Meu Perfil */}
        <div className="glass-panel profile-user-card me">
          <div className="profile-avatar-wrapper">
            {me.avatarUrl ? (
              <img src={me.avatarUrl} alt={me.username} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                {me.username.substring(0, 2).toUpperCase()}
              </div>
            )}
            {me.moodEmoji && (
              <span className="profile-mood-badge" title="Humor atual">
                {me.moodEmoji}
              </span>
            )}
          </div>
          <h2 className="profile-username">{me.username} <span className="profile-tag-you">({language === 'pt' ? 'Tu' : 'You'})</span></h2>
          
          <label className={`btn btn-primary profile-avatar-upload-btn ${uploading ? 'disabled' : ''}`}>
            {uploading ? (language === 'pt' ? 'A enviar...' : 'Uploading...') : (t.profile_change_avatar || 'Alterar Foto de Perfil')}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              disabled={uploading} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>

        {/* Separador de Coração Animado */}
        <div className="profile-heart-divider">
          <span className="pulsing-heart">❤️</span>
        </div>

        {/* Perfil do Parceiro */}
        <div className="glass-panel profile-user-card partner">
          <div className="profile-avatar-wrapper">
            {partner.avatarUrl ? (
              <img src={partner.avatarUrl} alt={partner.username} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder partner-placeholder">
                {partner.username.substring(0, 2).toUpperCase()}
              </div>
            )}
            {partner.moodEmoji && (
              <span className="profile-mood-badge" title="Humor atual">
                {partner.moodEmoji}
              </span>
            )}
          </div>
          <h2 className="profile-username">{partner.username}</h2>
          <div className="profile-partner-status">
            {language === 'pt' ? 'O teu amor' : 'Your love'} 💖
          </div>
        </div>
      </div>

      {/* Estatísticas do Casal */}
      {stats && (
        <div className="profile-stats-section">
          <h2 className="stats-section-title">📊 {language === 'pt' ? 'As Nossas Conquistas' : 'Our Achievements'}</h2>
          
          <div className="profile-stats-grid">
            {/* Quizzes */}
            <div className="glass-panel stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-content">
                <h3>{t.profile_quizzes_stat || 'Quizzes Respondidos'}</h3>
                <p className="stat-number">{stats.quizzes.completed} / {stats.quizzes.total}</p>
                <div className="stat-progress-bar">
                  <div 
                    className="stat-progress" 
                    style={{ width: `${stats.quizzes.total > 0 ? (stats.quizzes.completed / stats.quizzes.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Sintonia Likely */}
            <div className="glass-panel stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>{t.profile_likely_stat || 'Sintonia no Jogo'}</h3>
                <p className="stat-number">{stats.likely.matched} / {stats.likely.total}</p>
                <div className="stat-progress-bar">
                  <div 
                    className="stat-progress" 
                    style={{ width: `${stats.likely.total > 0 ? (stats.likely.matched / stats.likely.total) * 100 : 0}%`, backgroundColor: 'var(--ocean-accent, #00bbf9)' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Vales Resgatados */}
            <div className="glass-panel stat-card">
              <div className="stat-icon">🎟️</div>
              <div className="stat-content">
                <h3>{t.profile_coupons_stat || 'Vales Usados'}</h3>
                <p className="stat-number">{stats.couponsCount}</p>
                <span className="stat-subtitle">{language === 'pt' ? 'Mimos resgatados!' : 'Coupons redeemed!'}</span>
              </div>
            </div>

            {/* Raspadinhas */}
            <div className="glass-panel stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-content">
                <h3>{t.profile_scratched_stat || 'Raspadinhas Completas'}</h3>
                <p className="stat-number">{stats.scratchCards.scratched} / {stats.scratchCards.total}</p>
                <div className="stat-progress-bar">
                  <div 
                    className="stat-progress" 
                    style={{ width: `${stats.scratchCards.total > 0 ? (stats.scratchCards.scratched / stats.scratchCards.total) * 100 : 0}%`, backgroundColor: 'var(--primary-color, #ff4d6d)' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Bucket List */}
            <div className="glass-panel stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>{t.profile_bucket_stat || 'Desejos Realizados'}</h3>
                <p className="stat-number">{stats.bucketList.completed} / {stats.bucketList.total}</p>
                <div className="stat-progress-bar">
                  <div 
                    className="stat-progress" 
                    style={{ width: `${stats.bucketList.total > 0 ? (stats.bucketList.completed / stats.bucketList.total) * 100 : 0}%`, backgroundColor: 'var(--lavender-accent, #7209b7)' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Memórias e Fotos */}
            <div className="glass-panel stat-card double-stat">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>{language === 'pt' ? 'Memórias & Fotos' : 'Memories & Photos'}</h3>
                <div className="double-stat-numbers">
                  <div>
                    <span className="stat-number">{stats.memoriesCount}</span>
                    <span className="stat-label">{t.profile_memories_stat || 'Memórias'}</span>
                  </div>
                  <div className="stat-divider-vertical"></div>
                  <div>
                    <span className="stat-number">{stats.photosCount}</span>
                    <span className="stat-label">{t.profile_photos_stat || 'Fotos'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
