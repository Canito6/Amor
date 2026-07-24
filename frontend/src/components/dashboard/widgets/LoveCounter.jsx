import { useEffect, useState } from 'react';
import AnimatedNumber from '../../shared/AnimatedNumber';

export default function LoveCounter({ relationshipDate, language, t, streak = 0 }) {
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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

  if (!relationshipDate) {
    return (
      <div className="counter-widget fade-in" style={{ padding: '20px', textAlign: 'center' }}>
        <span className="pulsing-heart" style={{ fontSize: '32px' }}>💖</span>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '10px 0', fontWeight: '600' }}>
          {language === 'pt' ? 'Define a vossa data de namoro nas informações do casal para acompanhar os dias juntos!' : 'Set your relationship date to track your days together!'}
        </p>
      </div>
    );
  }

  const formattedRelationshipDate = new Date(relationshipDate).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const nextMilestone = Math.ceil((timeTogether.days + 1) / 100) * 100;
  const daysToMilestone = nextMilestone - timeTogether.days;

  return (
    <div className="counter-widget fade-in">
      <div className="pulsing-heart-wrapper">
        <span className="pulsing-heart">❤️</span>
      </div>
      
      {streak > 0 && (
        <div 
          className="streak-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #FF9F43 0%, #FF5252 100%)',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 'bold',
            boxShadow: '0 4px 10px rgba(255, 82, 82, 0.3)',
            marginBottom: '15px'
          }}
        >
          <span>🔥</span>
          <span>{streak} {language === 'en' ? 'days streak' : 'dias seguidos'}</span>
        </div>
      )}

      <h2 className="counter-title">
        {t.memories_counter_title || 'Contador do Amor'}
      </h2>
      <div className="counter-grid">
        <div className="counter-item">
          <span className="counter-value">
            <AnimatedNumber value={timeTogether.days} isFirstLoad={isFirstLoad} />
          </span>
          <span className="counter-label">{language === 'en' ? 'Days' : 'Dias'}</span>
        </div>
        <div className="counter-item">
          <span className="counter-value">
            <AnimatedNumber value={String(timeTogether.hours).padStart(2, '0')} isFirstLoad={isFirstLoad} />
          </span>
          <span className="counter-label">{language === 'en' ? 'Hours' : 'Horas'}</span>
        </div>
        <div className="counter-item">
          <span className="counter-value">
            <AnimatedNumber value={String(timeTogether.minutes).padStart(2, '0')} isFirstLoad={isFirstLoad} />
          </span>
          <span className="counter-label">{language === 'en' ? 'Mins' : 'Minutos'}</span>
        </div>
        <div className="counter-item">
          <span className="counter-value">
            <AnimatedNumber value={String(timeTogether.seconds).padStart(2, '0')} isFirstLoad={isFirstLoad} />
          </span>
          <span className="counter-label">{language === 'en' ? 'Secs' : 'Segundos'}</span>
        </div>
      </div>
      <p className="counter-footer" style={{ marginBottom: '10px' }}>
        {language === 'en' 
          ? `Together since ${formattedRelationshipDate} ✨` 
          : `Juntos desde ${formattedRelationshipDate} ✨`}
      </p>
      <p className="milestone-subtext">
        {language === 'en'
          ? `✨ Only ${daysToMilestone} days left to reach the ${nextMilestone} days milestone! ✨`
          : `✨ Faltam apenas ${daysToMilestone} dias para o marco de ${nextMilestone} dias juntos! ✨`}
      </p>
    </div>
  );
}

