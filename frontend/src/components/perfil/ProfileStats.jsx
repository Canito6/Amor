import React from 'react';

export default function ProfileStats({ stats, language, t }) {
  return (
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
                className="stat-progress progress-quizzes" 
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
                className="stat-progress progress-likely" 
                style={{ width: `${stats.likely.total > 0 ? (stats.likely.matched / stats.likely.total) * 100 : 0}%` }}
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
                className="stat-progress progress-scratch" 
                style={{ width: `${stats.scratchCards.total > 0 ? (stats.scratchCards.scratched / stats.scratchCards.total) * 100 : 0}%` }}
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
                className="stat-progress progress-bucket" 
                style={{ width: `${stats.bucketList.total > 0 ? (stats.bucketList.completed / stats.bucketList.total) * 100 : 0}%` }}
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
  );
}
