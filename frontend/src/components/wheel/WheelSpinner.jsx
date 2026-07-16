import React from 'react';

const PASTEL_COLORS = [
  '#FF6B9D', // Primária
  '#C589E8', // Secundária
  '#FF8EAD', // Soft pink
  '#D6A6F5', // Soft lavender
  '#FFB4A2', // Soft coral
  '#B5EAD7', // Pale mint
  '#A0C4FF', // Soft sky blue
  '#FFC6FF'  // Soft magenta
];

// Funções geométricas para gerar o círculo SVG dividido em fatias
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "Z"
  ].join(" ");
};

export default function WheelSpinner({
  selectedWheel,
  rotation,
  isSpinning,
  spinWheel,
  result,
  t
}) {
  if (!selectedWheel) return null;

  return (
    <div className="wheel-workspace fade-in">
      <div className="wheel-container">
        {/* Seta do Ponteiro (Indicador) */}
        <div className="wheel-pointer">▼</div>

        {/* SVG da Roleta com rotação dinâmica em linha */}
        <svg 
          className="wheel-svg" 
          viewBox="0 0 300 300"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
          }}
        >
          <g className="wheel-svg-group">
            {selectedWheel.options.map((option, index) => {
              const optionsCount = selectedWheel.options.length;
              const sliceAngle = 360 / optionsCount;
              const startAngle = index * sliceAngle;
              const endAngle = startAngle + sliceAngle;
              const color = PASTEL_COLORS[index % PASTEL_COLORS.length];

              // Ângulo para alinhar o texto no centro da fatia
              const textAngle = startAngle + sliceAngle / 2;
              const textPos = polarToCartesian(150, 150, 100, textAngle);

              return (
                <g key={index}>
                  {/* Fatia da Roleta */}
                  <path
                    d={describeArc(150, 150, 140, startAngle, endAngle)}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  
                  {/* Texto da Opção rotacionado */}
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    fill="#2b2d42"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="var(--font-title)"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    transform={`rotate(${textAngle}, ${textPos.x}, ${textPos.y})`}
                  >
                    {option.length > 12 ? option.substring(0, 10) + '..' : option}
                  </text>
                </g>
              );
            })}
            {/* Pino Central */}
            <circle cx="150" cy="150" r="16" fill="#ffffff" stroke="#2b2d42" strokeWidth="2" />
            <circle cx="150" cy="150" r="8" fill="var(--primary-color)" />
          </g>
        </svg>
      </div>

      {/* Spin Button */}
      <div className="wheel-actions-container">
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="btn btn-primary btn-spin-trigger"
        >
          {isSpinning ? (t.wheel_spinning || 'A girar...') : (t.wheel_spin_btn || 'Girar Roleta!')}
        </button>
      </div>

      {/* Lightbox do Resultado */}
      {result && !isSpinning && (
        <div className="wheel-result-banner glass-panel fade-in">
          <span className="celebration-emojis">🎉🥳</span>
          <h3>{t.wheel_result_title}</h3>
          <p className="wheel-result-text">{result}</p>
        </div>
      )}
    </div>
  );
}
