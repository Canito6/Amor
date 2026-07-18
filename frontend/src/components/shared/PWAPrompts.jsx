import React from 'react';
import { usePWA } from '../../context/PWAContext';
import { usePreferences } from '../../context/PreferencesContext';
import { translations } from '../../services/common/translations';
import { motion, AnimatePresence } from 'framer-motion';
import './PWAPrompts.css';

export default function PWAPrompts() {
  const { 
    updateAvailable, 
    updateApp, 
    showIOSPrompt, 
    dismissIOSPrompt 
  } = usePWA();
  
  const { language } = usePreferences();
  const t = translations[language] || translations['pt'];

  return (
    <div className="pwa-prompts-container">
      {/* 1. Service Worker Update Banner */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div 
            className="pwa-toast pwa-update-toast glass-panel"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="pwa-toast-content">
              <span className="pwa-toast-icon">🚀</span>
              <div className="pwa-toast-text">
                <h4>{t.pwa_update_title}</h4>
                <p>{t.pwa_update_desc}</p>
              </div>
            </div>
            <button className="btn btn-primary btn-sm pwa-toast-btn" onClick={updateApp}>
              {t.pwa_update_btn}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. iOS Installation Manual Instructions Banner */}
      <AnimatePresence>
        {showIOSPrompt && (
          <motion.div 
            className="pwa-toast pwa-ios-toast glass-panel"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="pwa-toast-header">
              <h3>{t.pwa_ios_install_title}</h3>
              <button className="pwa-close-btn" onClick={dismissIOSPrompt}>✕</button>
            </div>
            <div className="pwa-ios-steps">
              <p>{t.pwa_ios_install_step1}</p>
              <p>{t.pwa_ios_install_step2}</p>
              <p>{t.pwa_ios_install_step3}</p>
            </div>
            <button className="btn btn-dark pwa-toast-btn-dismiss" onClick={dismissIOSPrompt}>
              {t.pwa_ios_install_dismiss}
            </button>
            <div className="pwa-ios-arrow"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
