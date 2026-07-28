import { createContext, useState, useEffect, useContext } from 'react';
import { themePresets, adjustColorBrightness } from '../utils/ui/themeUtils';

// eslint-disable-next-line react-refresh/only-export-components
export { themePresets };

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'pt');
  const [globalTheme, setTheme] = useState(() => {
    const saved = localStorage.getItem('globalTheme');
    if (saved) return saved;
    // Deteção automática por horário (20h - 7h) na primeira visita
    const hour = new Date().getHours();
    return (hour >= 20 || hour < 7) ? 'dark' : 'light';
  });
  const [colorTheme, setColorTheme] = useState(() => localStorage.getItem('colorTheme') || 'dynamic');
  const [activeTabTheme, setActiveTabTheme] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? saved === 'true' : true;
  });

  // Guardar preferências locais
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const changeGlobalTheme = (theme) => {
    setTheme(theme);
    localStorage.setItem('globalTheme', theme);
  };

  const changeColorTheme = (theme) => {
    setColorTheme(theme);
    localStorage.setItem('colorTheme', theme);
  };

  const toggleSound = (enabled) => {
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', String(enabled));
  };

  // Função auxiliar para aplicar cores e gradientes dinâmicos do tab ativo
  const applyTabSpecificTheme = (themeConfig, forceDarkState = null) => {
    const root = document.documentElement;
    let accent;
    let gradient;

    const isDark = forceDarkState !== null ? forceDarkState : (
      globalTheme === 'dark' || 
      (globalTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    // Apply colorTheme override if not dynamic
    const activePreset = colorTheme !== 'dynamic' ? colorTheme : (themeConfig?.preset || 'romance');

    if (colorTheme === 'dynamic' && themeConfig && !themePresets[themeConfig.preset]) {
      // Custom tab with custom custom colors
      accent = themeConfig.accentColor || '#ff4d6d';
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 77, 109';
      };
      const rgb = hexToRgb(accent);
      
      if (isDark) {
        gradient = `linear-gradient(-45deg, rgba(${rgb}, 0.15), #12121e, #1a1b2d, rgba(${rgb}, 0.05))`;
      } else {
        gradient = `linear-gradient(-45deg, rgba(${rgb}, 0.15), #ffffff, #fff0f3, rgba(${rgb}, 0.1))`;
      }
    } else {
      const presetObj = themePresets[activePreset] || themePresets['romance'];
      accent = presetObj.accent;
      gradient = isDark ? presetObj.darkGradient : presetObj.lightGradient;
    }

    root.style.setProperty('--primary-color', accent);
    root.style.setProperty('--primary-hover', adjustColorBrightness(accent, 15));
    root.style.setProperty('--bg-gradient', gradient);
  };

  // Monitorizar preferências de tema do sistema e aplicar classes
  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = () => {
      const isDark = globalTheme === 'dark' || 
        (globalTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('theme-dark');
        root.classList.remove('theme-light');
      } else {
        root.classList.add('theme-light');
        root.classList.remove('theme-dark');
      }
      
      // Forçar atualização do gradiente de fundo e da cor de destaque.
      // Nota: applyTabSpecificTheme já trata de activeTabTheme === null (usa o preset 'romance'
      // por omissão), por isso deve ser sempre chamada — caso contrário, mudar o "Tema de Cores
      // Global" em páginas sem tema de rota próprio (ex: Definições) não teria qualquer efeito visível.
      applyTabSpecificTheme(activeTabTheme, isDark);
    };

    applyTheme();

    // Ouvir alterações no sistema caso seja 'system'
    if (globalTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [globalTheme, activeTabTheme, colorTheme]);

  return (
    <PreferencesContext.Provider value={{
      language,
      changeLanguage,
      globalTheme,
      changeGlobalTheme,
      colorTheme,
      changeColorTheme,
      soundEnabled,
      toggleSound,
      setActiveTabTheme,
      applyTabSpecificTheme
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePreferences = () => useContext(PreferencesContext);
