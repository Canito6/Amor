import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { authService } from '../../services/auth/authService';
import { useToast } from '../../context/ToastContext';

export default function GeneralSettings({
  t,
  language,
  changeLanguage,
  layoutStyle,
  changeLayoutStyle,
  globalTheme,
  changeGlobalTheme,
  colorTheme,
  changeColorTheme
}) {
  const { soundEnabled, toggleSound } = usePreferences();
  const { showToast } = useToast();

  const [pushSupported, setPushSupported] = React.useState(false);
  const [pushEnabled, setPushEnabled] = React.useState(false);
  const [loadingPush, setLoadingPush] = React.useState(false);

  // Helper function to convert base64 VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  React.useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setPushEnabled(!!subscription);
        });
      });
    }
  }, []);

  const handleTogglePush = async (checked) => {
    if (loadingPush) return;
    setLoadingPush(true);

    try {
      if (checked) {
        // Pedir permissão de notificações (ação voluntária não intrusiva)
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast(language === 'pt' ? 'Permissão de notificações rejeitada.' : 'Notification permission denied.', 'error');
          setLoadingPush(false);
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const res = await authService.getVapidPublicKey();
        if (!res || !res.publicKey) {
          throw new Error('Chave pública VAPID não encontrada no backend.');
        }

        const convertedKey = urlBase64ToUint8Array(res.publicKey);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });

        await authService.subscribePush(subscription);
        setPushEnabled(true);
        showToast(language === 'pt' ? 'Notificações ativadas com sucesso!' : 'Notifications enabled successfully!', 'success');
      } else {
        // Cancelar subscrição
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await authService.unsubscribePush(subscription.endpoint);
        }
        setPushEnabled(false);
        showToast(language === 'pt' ? 'Notificações desativadas.' : 'Notifications disabled.', 'success');
      }
    } catch (err) {
      console.error('Erro ao configurar notificações push:', err);
      showToast(language === 'pt' ? 'Erro ao configurar notificações push.' : 'Error setting up push notifications.', 'error');
    } finally {
      setLoadingPush(false);
    }
  };

  return (
    <section className="settings-section">
      <h3>🛠️ {language === 'pt' ? 'Geral' : 'General'}</h3>
      
      {/* Language Selection */}
      <div className="form-group">
        <label className="input-label">{t.language}</label>
        <select 
          value={language} 
          onChange={(e) => changeLanguage(e.target.value)}
          className="input-control"
        >
          <option value="pt">Português 🇵🇹</option>
          <option value="en">English 🇬🇧</option>
          <option value="es">Español 🇪🇸</option>
        </select>
      </div>

      {/* Layout Style Selection */}
      <div className="form-group">
        <label className="input-label">{t.layout_style}</label>
        <select 
          value={layoutStyle} 
          onChange={(e) => changeLayoutStyle(e.target.value)}
          className="input-control"
        >
          <option value="sidebar">{t.layout_sidebar}</option>
          <option value="stacked">{t.layout_stacked}</option>
        </select>
      </div>

      {/* Global Theme Selection */}
      <div className="form-group">
        <label className="input-label">{t.global_theme}</label>
        <select 
          value={globalTheme} 
          onChange={(e) => changeGlobalTheme(e.target.value)}
          className="input-control"
        >
          <option value="light">☀️ {t.theme_light}</option>
          <option value="dark">🌙 {t.theme_dark}</option>
          <option value="system">💻 {t.theme_system}</option>
        </select>
      </div>

      {/* Global Color Theme Selection */}
      <div className="form-group">
        <label className="input-label">{language === 'pt' ? 'Tema de Cores Global' : 'Global Color Theme'}</label>
        <select 
          value={colorTheme} 
          onChange={(e) => changeColorTheme(e.target.value)}
          className="input-control"
        >
          <option value="dynamic">✨ {language === 'pt' ? 'Dinâmico (por Página)' : 'Dynamic (per Page)'}</option>
          <option value="romance">💖 {language === 'pt' ? 'Romance' : 'Romance'}</option>
          <option value="sunset">🌅 {language === 'pt' ? 'Pôr do Sol' : 'Sunset'}</option>
          <option value="lavender">🔮 {language === 'pt' ? 'Lavanda' : 'Lavender'}</option>
          <option value="mint">🍃 {language === 'pt' ? 'Menta' : 'Mint'}</option>
          <option value="ocean">🌊 {language === 'pt' ? 'Oceano' : 'Ocean'}</option>
          <option value="cotton_candy">🍭 {language === 'pt' ? 'Algodão Doce' : 'Cotton Candy'}</option>
        </select>
      </div>

      {/* Sound Selection */}
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
        <label className="input-label" style={{ margin: 0, cursor: 'pointer' }} htmlFor="sound-toggle-input">
          🔊 {language === 'pt' ? 'Sons da Interface' : 'Interface Sounds'}
        </label>
        <input 
          id="sound-toggle-input"
          type="checkbox" 
          checked={soundEnabled} 
          onChange={(e) => toggleSound(e.target.checked)}
          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
        />
      </div>

      {/* Push Notifications Toggle */}
      {pushSupported && (
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
          <label className="input-label" style={{ margin: 0, cursor: 'pointer' }} htmlFor="push-toggle-input">
            🔔 {language === 'pt' ? 'Notificações Push' : 'Push Notifications'}
          </label>
          <input 
            id="push-toggle-input"
            type="checkbox" 
            checked={pushEnabled} 
            disabled={loadingPush}
            onChange={(e) => handleTogglePush(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
          />
        </div>
      )}
    </section>
  );
}
