import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';
import { authService } from '../../services/auth/authService';
import { useToast } from '../../context/ToastContext';
import { usePWA } from '../../context/PWAContext';
import { useAppLock } from '../../context/AppLockContext';

export function SecuritySettings({ language }) {
  const { pinEnabled, enablePin, disablePin, biometricsEnabled, toggleBiometrics } = useAppLock();
  const { showToast } = useToast();
  const [pinInput, setPinInput] = React.useState('');
  const [isEditingPin, setIsEditingPin] = React.useState(false);

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      enablePin(pinInput);
      setPinInput('');
      setIsEditingPin(false);
      showToast(language === 'pt' ? 'PIN de 4 dígitos ativado!' : '4-digit PIN enabled!', 'success');
    } else {
      showToast(language === 'pt' ? 'O PIN deve ter exatamente 4 dígitos.' : 'PIN must be exactly 4 digits.', 'error');
    }
  };

  return (
    <section className="settings-section" style={{ marginTop: '30px' }}>
      <h3>🔒 {language === 'pt' ? 'Segurança & Bloqueio da App' : 'Security & App Lock'}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
        {language === 'pt'
          ? 'Protege o teu AMORI com um PIN de 4 dígitos e biometria (Face ID / Touch ID / Impressão Digital).'
          : 'Protect your AMORI with a 4-digit PIN and biometrics (Face ID / Touch ID / Fingerprint).'}
      </p>

      {/* Switch do PIN */}
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <label className="input-label" style={{ margin: 0, cursor: 'pointer' }}>
          🔑 {language === 'pt' ? 'Ativar Bloqueio por PIN' : 'Enable PIN Lock'}
        </label>
        <input
          type="checkbox"
          checked={pinEnabled}
          onChange={(e) => {
            if (e.target.checked) {
              setIsEditingPin(true);
            } else {
              disablePin();
              setIsEditingPin(false);
              showToast(language === 'pt' ? 'Bloqueio por PIN desativado.' : 'PIN Lock disabled.', 'info');
            }
          }}
          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
        />
      </div>

      {isEditingPin && (
        <div style={{ background: 'rgba(255, 77, 109, 0.08)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
          <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>
            {language === 'pt' ? 'Define o novo PIN de 4 dígitos:' : 'Set new 4-digit PIN:'}
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="input-control"
              style={{ width: '120px', textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
            />
            <button onClick={handleSavePin} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px' }}>
              {language === 'pt' ? 'Guardar PIN' : 'Save PIN'}
            </button>
          </div>
        </div>
      )}

      {/* Switch da Biometria */}
      {pinEnabled && (
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '15px' }}>
          <label className="input-label" style={{ margin: 0, cursor: 'pointer' }}>
            👆 {language === 'pt' ? 'Permitir Face ID / Biometria' : 'Allow Face ID / Biometrics'}
          </label>
          <input
            type="checkbox"
            checked={biometricsEnabled}
            onChange={(e) => {
              toggleBiometrics(e.target.checked);
              showToast(e.target.checked 
                ? (language === 'pt' ? 'Biometria ativada!' : 'Biometrics enabled!') 
                : (language === 'pt' ? 'Biometria desativada.' : 'Biometrics disabled.'), 'info');
            }}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
          />
        </div>
      )}
    </section>
  );
}

export function BackupSettings({ language }) {
  const { showToast } = useToast();
  const [exportingJSON, setExportingJSON] = React.useState(false);
  const [exportingPDF, setExportingPDF] = React.useState(false);

  const handleExportJSON = async () => {
    if (exportingJSON) return;
    setExportingJSON(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' && window.location.port === '5173' ? 'http://localhost:5000' : '');
      
      const headers = {};
      if (token && token !== 'session_active') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/couple/export`, {
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor (${response.status})`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_casal_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      showToast(language === 'pt' ? 'Dados exportados com sucesso!' : 'Data exported successfully!', 'success');
    } catch (err) {
      console.error('Erro ao exportar JSON:', err);
      showToast(err.message || (language === 'pt' ? 'Erro ao exportar dados.' : 'Error exporting data.'), 'error');
    } finally {
      setExportingJSON(false);
    }
  };

  const handleExportPDF = async () => {
    if (exportingPDF) return;
    setExportingPDF(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' && window.location.port === '5173' ? 'http://localhost:5000' : '');
      
      const headers = {};
      if (token && token !== 'session_active') {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/couple/export/pdf`, {
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor (${response.status})`);
      }
      
      const blob = await response.blob();
      const filename = `album_memorias_${new Date().toISOString().split('T')[0]}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Usar Web Share API em telemóveis para partilhar diretamente para WhatsApp ou Guardar em Ficheiros
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Álbum de Memórias AMORI 💖',
            text: 'O nosso álbum de memórias especial em PDF.'
          });
          showToast(language === 'pt' ? 'Álbum partilhado com sucesso!' : 'Album shared successfully!', 'success');
          return;
        } catch {
          // Se o utilizador fechar a folha de partilha nativa sem partilhar
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      showToast(language === 'pt' ? 'Álbum de memórias exportado com sucesso!' : 'Memory album exported successfully!', 'success');
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
      showToast(err.message || (language === 'pt' ? 'Erro ao exportar álbum de memórias.' : 'Error exporting memory album.'), 'error');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <section className="settings-section" style={{ marginTop: '30px' }}>
      <h3>🔒 {language === 'pt' ? 'Cópia de Segurança e Exportação' : 'Backup and Data Export'}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
        {language === 'pt' 
          ? 'Descarrega uma cópia completa dos dados partilhados do teu casal. Podes exportar em formato JSON (contém todas as memórias, mensagens, desejos e conquistas de forma estruturada) ou gerar um Álbum de Memórias em formato PDF.' 
          : 'Download a complete copy of your shared couple data. You can export in JSON format (contains all memories, messages, wishes, and achievements structured) or generate a PDF Memory Album.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <button 
            onClick={handleExportJSON}
            disabled={exportingJSON}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', cursor: exportingJSON ? 'not-allowed' : 'pointer', opacity: exportingJSON ? 0.7 : 1 }}
          >
            📥 {exportingJSON 
              ? (language === 'pt' ? 'A exportar...' : 'Exporting...') 
              : (language === 'pt' ? 'Exportar os meus dados (JSON)' : 'Export My Data (JSON)')}
          </button>
          <small style={{ display: 'block', marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {language === 'pt' 
              ? 'Ideal para salvaguarda, backups locais ou importar noutras plataformas.' 
              : 'Ideal for local backup or importing into other platforms.'}
          </small>
        </div>

        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', cursor: exportingPDF ? 'not-allowed' : 'pointer', opacity: exportingPDF ? 0.7 : 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            📄 {exportingPDF 
              ? (language === 'pt' ? 'A gerar álbum PDF...' : 'Generating PDF album...') 
              : (language === 'pt' ? 'Exportar álbum de memórias (PDF)' : 'Export Memory Album (PDF)')}
          </button>
          <small style={{ display: 'block', marginTop: '5px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {language === 'pt' 
              ? 'O PDF inclui as últimas 150 memórias mais recentes. O histórico completo está disponível na exportação JSON.' 
              : 'The PDF contains the 150 most recent memories. The full history is available via JSON export.'}
          </small>
        </div>
      </div>
    </section>
  );
}

export default function GeneralSettings({
  t,
  language,
  changeLanguage,
  globalTheme,
  changeGlobalTheme,
  colorTheme,
  changeColorTheme,
  onClose
}) {
  const { soundEnabled, toggleSound } = usePreferences();
  const { showToast } = useToast();
  const { isInstallable, installApp, showIOSHelp } = usePWA();

  const isIOS = React.useMemo(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document);
  }, []);

  const isStandalone = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasMatchMedia = typeof window.matchMedia === 'function';
    return (hasMatchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
  }, []);

  const [pushSupported, setPushSupported] = React.useState(false);
  const [pushEnabled, setPushEnabled] = React.useState(false);
  const [loadingPush, setLoadingPush] = React.useState(false);

  const [cycleHidden, setCycleHidden] = React.useState(() => {
    return localStorage.getItem('cycle_hidden_from_menu') === 'true';
  });

  // Helper function to convert base64 VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
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

      {/* PWA Install Button (Android / Chrome) */}
      {isInstallable && (
        <div className="form-group" style={{ marginTop: '20px' }}>
          <button 
            onClick={installApp}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px' }}
          >
            📱 {t.pwa_install_btn}
          </button>
        </div>
      )}

      {/* PWA iOS Install Help Button */}
      {isIOS && !isStandalone && (
        <div className="form-group" style={{ marginTop: '20px' }}>
          <button 
            onClick={() => {
              showIOSHelp();
              if (typeof onClose === 'function') onClose();
            }}
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          >
            📱 {t.pwa_ios_settings_help}
          </button>
        </div>
      )}

      {/* Toggle Ocultar Calendário Menstrual do Menu */}
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', marginTop: '20px', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="input-label" style={{ margin: 0, cursor: 'pointer' }} htmlFor="cycle-hidden-toggle">
            🌸 {language === 'pt' ? 'Ocultar Calendário Menstrual do meu menu' : 'Hide Menstrual Calendar from menu'}
          </label>
          <input 
            id="cycle-hidden-toggle"
            type="checkbox" 
            checked={cycleHidden} 
            onChange={(e) => {
              const checked = e.target.checked;
              setCycleHidden(checked);
              localStorage.setItem('cycle_hidden_from_menu', checked ? 'true' : 'false');
              window.dispatchEvent(new Event('refreshSidebar'));
            }}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
          />
        </div>
        <small style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {language === 'pt' 
            ? 'Controla se o atalho do Calendário Menstrual aparece no teu menu de navegação lateral.'
            : 'Controls whether the Menstrual Calendar shortcut appears on your side navigation menu.'}
        </small>
      </div>

      {/* Security & Biometrics Section */}
      <SecuritySettings language={language} />
    </section>
  );
}
