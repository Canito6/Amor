import React from 'react';

export default function AchievementsGrid({ achievements, language }) {
  return (
    <>
      <h3 className="badges-section-title">
        🎖️ {language === 'pt' ? 'Conquistas Desbloqueadas' : 'Achievements Unlocked'}
      </h3>
      <div className="achievements-badges-grid">
        {achievements.map((ach) => (
          <div 
            key={ach.id} 
            className={`achievement-badge-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
            title={ach.desc}
          >
            <div className="badge-icon-wrapper">
              <span className="badge-icon">{ach.icon}</span>
            </div>
            <h4 className="badge-title">{ach.title}</h4>
            <p className="badge-desc">{ach.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}
