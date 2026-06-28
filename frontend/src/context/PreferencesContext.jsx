import React, { createContext, useState, useEffect, useContext } from 'react';
import { themePresets, adjustColorBrightness } from '../utils/ui/themeUtils';

export { themePresets };

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'pt');
  const [layoutStyle, setLayoutStyle] = useState(() => localStorage.getItem('layoutStyle') || 'sidebar');
  const [globalTheme, setTheme] = useState(() => localStorage.getItem('globalTheme') || 'system');
  const [activeTabTheme, setActiveTabTheme] = useState(null);

  // Guardar preferências locais
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const changeLayoutStyle = (style) => {
    setLayoutStyle(style);
    localStorage.setItem('layoutStyle', style);
  };

  const changeGlobalTheme = (theme) => {
    setTheme(theme);
    localStorage.setItem('globalTheme', theme);
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
      
      // Forçar atualização do gradiente de fundo se houver um tema ativo
      if (activeTabTheme) {
        applyTabSpecificTheme(activeTabTheme, isDark);
      }
    };

    applyTheme();

    // Ouvir alterações no sistema caso seja 'system'
    if (globalTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [globalTheme, activeTabTheme]);

  // Função auxiliar para aplicar cores e gradientes dinâmicos do tab ativo
  const applyTabSpecificTheme = (themeConfig, forceDarkState = null) => {
    const root = document.documentElement;
    let accent = '#ff4d6d';
    let gradient = '';

    const isDark = forceDarkState !== null ? forceDarkState : (
      globalTheme === 'dark' || 
      (globalTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    if (themeConfig) {
      if (themePresets[themeConfig.preset]) {
        const presetObj = themePresets[themeConfig.preset];
        accent = presetObj.accent;
        gradient = isDark ? presetObj.darkGradient : presetObj.lightGradient;
      } else {
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
      }
    } else {
      // Tema base do Dashboard/Login
      accent = '#ff4d6d';
      gradient = isDark 
        ? 'linear-gradient(-45deg, #2d0015, #15002b, #001724, #12121e)'
        : 'linear-gradient(-45deg, #ffccd5, #ffcad4, #b5e2fa, #ffe5ec)';
    }

    root.style.setProperty('--primary-color', accent);
    root.style.setProperty('--primary-hover', adjustColorBrightness(accent, 15));
    root.style.setProperty('--bg-gradient', gradient);
  };

  return (
    <PreferencesContext.Provider value={{
      language,
      changeLanguage,
      layoutStyle,
      changeLayoutStyle,
      globalTheme,
      changeGlobalTheme,
      setActiveTabTheme,
      applyTabSpecificTheme
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
