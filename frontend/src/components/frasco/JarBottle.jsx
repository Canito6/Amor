import React from 'react';

export default function JarBottle({
  notes,
  isShaking,
  language,
  onDraw
}) {
  return (
    <div 
      className={`jar-bottle-glass ${isShaking ? 'shaking' : ''}`} 
      onClick={onDraw}
    >
      <div className="jar-cork-lid"></div>
      <div className="jar-rope-tag">🎀</div>
      
      {/* Papelinhos flutuando lá dentro com base na quantidade */}
      <div className="jar-notes-inside">
        {notes.slice(0, 15).map((note, index) => {
          const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#bdb2ff', '#ffc6ff'];
          const randomColor = colors[index % colors.length];
          // Posicionar aleatoriamente de forma consistente
          const left = `${15 + (index * 13) % 70}%`;
          const bottom = `${10 + (index * 8) % 60}%`;
          const rotate = `${((index * 45) % 180) - 90}deg`;
          return (
            <div 
              key={index} 
              className="floating-jar-paper"
              style={{
                backgroundColor: randomColor,
                left,
                bottom,
                transform: `rotate(${rotate})`
              }}
            />
          );
        })}
      </div>
      
      <span className="jar-label-text">
        ✨ {notes.length} {language === 'pt' ? 'Mimos' : 'Notes'}
      </span>
    </div>
  );
}
