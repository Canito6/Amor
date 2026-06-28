import React, { useEffect, useState } from 'react';

export default function LoveCounter({ relationshipDate, language, t }) {
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!relationshipDate) return;

    const calculateTime = () => {
      const start = new Date(relationshipDate);
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
  }, [relationshipDate]);

  if (!relationshipDate) return null;

  const formattedRelationshipDate = new Date(relationshipDate).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
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
  );
}
