export const themePresets = {
  romance: {
    accent: '#ff4d6d',
    lightGradient: 'linear-gradient(-45deg, #ffe5ec, #ffccd5, #ffb3c1, #fff0f3)',
    darkGradient: 'linear-gradient(-45deg, #2d0015, #4d002b, #1d000f, #3a001a)'
  },
  sunset: {
    accent: '#f77f00',
    lightGradient: 'linear-gradient(-45deg, #ffe6d9, #ffd2bd, #ffbda3, #fff0eb)',
    darkGradient: 'linear-gradient(-45deg, #3d1400, #571e00, #240700, #381200)'
  },
  lavender: {
    accent: '#7209b7',
    lightGradient: 'linear-gradient(-45deg, #f3e8ff, #e9d5ff, #d8b4fe, #faf5ff)',
    darkGradient: 'linear-gradient(-45deg, #25003d, #3c0061, #140026, #2d0047)'
  },
  mint: {
    accent: '#06d6a0',
    lightGradient: 'linear-gradient(-45deg, #e6fffa, #b2f5ea, #81e6d9, #f0fdfa)',
    darkGradient: 'linear-gradient(-45deg, #002d23, #004d3b, #001a14, #003d2f)'
  },
  ocean: {
    accent: '#4cc9f0',
    lightGradient: 'linear-gradient(-45deg, #e0f2fe, #bae6fd, #7dd3fc, #f0f9ff)',
    darkGradient: 'linear-gradient(-45deg, #002c40, #004666, #001724, #003752)'
  },
  cotton_candy: {
    accent: '#ff85a2',
    lightGradient: 'linear-gradient(-45deg, #ffe5ec, #f0fdfa, #e0f2fe, #fff0f3)',
    darkGradient: 'linear-gradient(-45deg, #4d001b, #002d23, #002c40, #2a0835)'
  }
};

// Ajustador de brilho para criar hover color dinâmico
export function adjustColorBrightness(hex, percent) {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = Math.max(0, R);
  G = Math.max(0, G);
  B = Math.max(0, B);

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}
