import { BrowserRouter } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { TabProvider } from './context/TabContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { PWAProvider } from './context/PWAContext';
import { AppLockProvider } from './context/AppLockContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ScrollToTop from './components/shared/ScrollToTop';
import AppRoutes from './routes/AppRoutes';
import PWAPrompts from './components/shared/PWAPrompts';
import AppLockModal from './components/shared/AppLockModal';
import RomanticParticles from './components/shared/RomanticParticles';
import FloatingBottomNav from './components/navigation/FloatingBottomNav';

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <AppLockProvider>
          <ToastProvider>
            <ConfirmProvider>
              <PWAProvider>
                <TabProvider>
                  <SocketProvider>
                    <BrowserRouter>
                      <RomanticParticles />
                      <ScrollToTop />
                      <AppRoutes />
                      <FloatingBottomNav />
                      <AppLockModal />
                    </BrowserRouter>
                  </SocketProvider>
                </TabProvider>
                <PWAPrompts />
              </PWAProvider>
            </ConfirmProvider>
          </ToastProvider>
        </AppLockProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;
