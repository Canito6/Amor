import React from 'react';
import PolaroidFrame from '../../shared/PolaroidFrame';

export default function OnThisDay({ memories = [], language = 'pt', t }) {
  if (!memories || memories.length === 0) return null;

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Filter memories matching the same day and month from previous years
  const matchingMemories = memories.filter(mem => {
    if (!mem.date) return false;
    const d = new Date(mem.date);
    
    // Ignore locked time capsules
    if (mem.locked || (mem.isTimeCapsule && new Date(mem.unlockDate) > today)) {
      return false;
    }
    
    return d.getDate() === currentDay &&
           d.getMonth() === currentMonth &&
           d.getFullYear() < currentYear;
  });

  if (matchingMemories.length === 0) return null;

  return (
    <div 
      className="glass-panel on-this-day-widget fade-in"
      style={{
        padding: '24px',
        marginBottom: '30px',
        border: '1.5px solid var(--primary-light)',
        background: 'linear-gradient(135deg, rgba(255, 107, 157, 0.08) 0%, rgba(197, 137, 232, 0.08) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        className="on-this-day-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}
      >
        <span style={{ fontSize: '26px' }}>✨⏳</span>
        <div>
          <h3 
            style={{ 
              fontFamily: 'var(--font-title)', 
              fontSize: '18px', 
              color: 'var(--text-main)', 
              margin: 0,
              fontWeight: 700 
            }}
          >
            {language === 'pt' ? 'Neste Dia...' : 'On This Day...'}
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
            {language === 'pt' ? 'Recordem momentos felizes de anos anteriores' : 'Remember happy moments from previous years'}
          </p>
        </div>
      </div>

      <div 
        className="on-this-day-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}
      >
        {matchingMemories.map(mem => {
          const memYear = new Date(mem.date).getFullYear();
          const yearsAgo = currentYear - memYear;
          const yearsAgoText = language === 'pt'
            ? `Há ${yearsAgo} ${yearsAgo === 1 ? 'ano' : 'anos'}`
            : `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`;

          return (
            <div 
              key={mem._id} 
              className="on-this-day-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <PolaroidFrame
                imageUrl={mem.imageUrl}
                title={mem.title}
                date={`${yearsAgoText} (${memYear})`}
                id={mem._id}
              >
                {mem.description && (
                  <p 
                    style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-muted)', 
                      margin: '8px 0 0 0',
                      lineHeight: '1.4',
                      textAlign: 'left'
                    }}
                  >
                    "{mem.description}"
                  </p>
                )}
              </PolaroidFrame>
            </div>
          );
        })}
      </div>
    </div>
  );
}
