import React, { createContext, useState, useEffect, useContext } from 'react';
import { tabService } from '../services/tabService';

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const [customTabs, setCustomTabs] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(false);

  // Carregar abas personalizadas do backend
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

  // Criar nova aba
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

  // Atualizar aba
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

  // Eliminar aba
  const deleteCustomTab = async (id) => {
    try {
      await tabService.deleteTab(id);
      setCustomTabs(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Erro ao eliminar aba:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCustomTabs();
  }, []);

  return (
    <TabContext.Provider value={{
      customTabs,
      loadingTabs,
      fetchCustomTabs,
      addCustomTab,
      updateCustomTab,
      deleteCustomTab
    }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => useContext(TabContext);
