import React from 'react';

export default function AchievementsProgress({
  xp,
  currentLevelXP,
  xpPerLevel,
  progressPercent,
  language
}) {
  return (
    <div className="xp-bar-container">
      <div className="xp-bar-info">
        <span>{xp} total XP</span>
        <span>{currentLevelXP} / {xpPerLevel} XP</span>
      </div>
      <div className="xp-progress-track">
        <div className="xp-progress-bar" style={{ width: `${progressPercent}%` }}></div>
      </div>
      <p className="xp-hint">
        {language === 'pt' 
          ? `Faltam ${xpPerLevel - currentLevelXP} XP para subir de nível! 🚀`
          : `Only ${xpPerLevel - currentLevelXP} XP left to level up! 🚀`}
      </p>
    </div>
  );
}
