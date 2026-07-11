import React from 'react';
import { calculateLevelAndXP, getAchievementsList } from './achievementsData';
import AchievementsProgress from './AchievementsProgress';
import AchievementsGrid from './AchievementsGrid';
import './AchievementsWidget.css';

export default function AchievementsWidget({ stats, t, language }) {
  if (!stats) {
    return (
      <div className="achievements-widget-panel glass-panel loading-achievements">
        <div className="spinner"></div>
      </div>
    );
  }

  const {
    xp,
    xpPerLevel,
    level,
    currentLevelXP,
    progressPercent
  } = calculateLevelAndXP(stats);

  const achievements = getAchievementsList(stats, language);

  return (
    <div className="achievements-widget-panel glass-panel fade-in">
      <div className="achievements-header">
        <h2 className="achievements-title">
          <span>🏆</span> {language === 'pt' ? 'Nível de Cumplicidade' : 'Cumplicity Level'}
        </h2>
        <div className="couple-level-badge">Lv. {level}</div>
      </div>

      <AchievementsProgress 
        xp={xp}
        currentLevelXP={currentLevelXP}
        xpPerLevel={xpPerLevel}
        progressPercent={progressPercent}
        language={language}
      />

      <AchievementsGrid 
        achievements={achievements}
        language={language}
      />
    </div>
  );
}
