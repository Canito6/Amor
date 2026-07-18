import { BrowserRouter } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { TabProvider } from './context/TabContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { PWAProvider } from './context/PWAContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';
import PWAPrompts from './components/shared/PWAPrompts';

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <ToastProvider>
          <ConfirmProvider>
            <PWAProvider>
              <TabProvider>
                <SocketProvider>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </SocketProvider>
              </TabProvider>
              <PWAPrompts />
            </PWAProvider>
          </ConfirmProvider>
        </ToastProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;
