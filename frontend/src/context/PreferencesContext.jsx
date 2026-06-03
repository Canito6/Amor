import React, { createContext, useState, useEffect, useContext } from 'react';
import { tabService } from '../services/tabService';
import { themePresets, adjustColorBrightness } from '../utils/themeUtils';

export { themePresets };

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'pt');
  const [layoutStyle, setLayoutStyle] = useState(() => localStorage.getItem('layoutStyle') || 'sidebar');
  const [globalTheme, setTheme] = useState(() => localStorage.getItem('globalTheme') || 'system');
  const [customTabs, setCustomTabs] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [activeTabTheme, setActiveTabTheme] = useState(null);

  // 1. Guardar preferências locais
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

  // 2. Carregar abas personalizadas do backend (com cache na memória)
  const fetchCustomTabs = async (force = false) => {
    if (customTabs.length > 0 && !force) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      setLoadingTabs(true);
      const data = await tabService.getTabs();
      setCustomTabs(data);
    } catch (err) {
      console.error('Erro ao carregar abas personalizadas:', err);
    } finally {
      setLoadingTabs(false);
    }
  };

  // 3. Criar nova aba no backend
  const addCustomTab = async (tabData) => {
    try {
      const newTab = await tabService.createTab(tabData);
      setCustomTabs(prev => [...prev, newTab]);
      return newTab;
    } catch (err) {
      console.error('Erro ao criar aba personalizada:', err);
      throw err;
    }
  };

  // 4. Atualizar aba personalizada no backend
  const updateCustomTab = async (id, tabData) => {
    try {
      const updatedTab = await tabService.updateTab(id, tabData);
      setCustomTabs(prev => prev.map(t => t._id === id ? updatedTab : t));
      return updatedTab;
    } catch (err) {
      console.error('Erro ao atualizar aba:', err);
      throw err;
    }
  };

  // 5. Eliminar aba no backend
  const deleteCustomTab = async (id) => {
    try {
      await tabService.deleteTab(id);
      setCustomTabs(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Erro ao eliminar aba:', err);
      throw err;
    }
  };

  // 6. Monitorizar preferências de tema do sistema e aplicar classes
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
      // Se for um preset
      if (themePresets[themeConfig.preset]) {
        const presetObj = themePresets[themeConfig.preset];
        accent = presetObj.accent;
        gradient = isDark ? presetObj.darkGradient : presetObj.lightGradient;
      } else {
        // Se for um tema personalizado criado pelo utilizador
        accent = themeConfig.accentColor || '#ff4d6d';
        // Gerar gradiente baseado na cor de destaque
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



  // Carrega as abas quando o utilizador tem token
  useEffect(() => {
    fetchCustomTabs();
  }, []);

  return (
    <PreferencesContext.Provider value={{
      language,
      changeLanguage,
      layoutStyle,
      changeLayoutStyle,
      globalTheme,
      changeGlobalTheme,
      customTabs,
      loadingTabs,
      fetchCustomTabs,
      addCustomTab,
      updateCustomTab,
      deleteCustomTab,
      setActiveTabTheme,
      applyTabSpecificTheme
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
