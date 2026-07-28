
import { optimizeCloudinaryUrl } from '../../utils/media/cloudinaryUrl';

export default function ProfileCards({
  me,
  partner,
  language,
  uploading,
  handleAvatarChange,
  t
}) {
  return (
    <div className="profile-cards-container">
      {/* Meu Perfil */}
      <div className="glass-panel profile-user-card me">
        <div className="profile-avatar-wrapper">
          {me.avatarUrl ? (
            <img src={optimizeCloudinaryUrl(me.avatarUrl, { width: 200 })} alt={me.username} className="profile-avatar-img" />
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
            <img src={optimizeCloudinaryUrl(partner.avatarUrl, { width: 200 })} alt={partner.username} className="profile-avatar-img" />
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
  );
}
