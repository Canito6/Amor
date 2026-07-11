import React from 'react';

export default function LikelyScoreCard({
  affinityScore,
  matchedCount,
  completedQuestionsLength,
  language,
  t
}) {
  return (
    <div className="glass-panel likely-score-widget fade-in">
      <div className="score-ring-container">
        <svg className="score-ring-svg" viewBox="0 0 100 100">
          <circle className="ring-bg" cx="50" cy="50" r="40" />
          <circle 
            className="ring-progress" 
            cx="50" 
            cy="50" 
            r="40" 
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * affinityScore) / 100}
          />
        </svg>
        <div className="score-ring-text">
          <span className="score-value">{affinityScore}%</span>
          <span className="score-label">{language === 'pt' ? 'Afinidade' : 'Affinity'}</span>
        </div>
      </div>

      <div className="score-stats-info">
        <h3>{t.likely_affinity_score || 'A vossa afinidade'}</h3>
        <p>
          {language === 'pt'
            ? `Acertaram em ${matchedCount} de ${completedQuestionsLength} perguntas completas!`
            : `Matched ${matchedCount} out of ${completedQuestionsLength} completed questions!`}
        </p>
      </div>
    </div>
  );
}
