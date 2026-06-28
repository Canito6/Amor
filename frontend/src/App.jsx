import { BrowserRouter } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { TabProvider } from './context/TabContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <ToastProvider>
          <ConfirmProvider>
            <TabProvider>
              <SocketProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </SocketProvider>
            </TabProvider>
          </ConfirmProvider>
        </ToastProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;
