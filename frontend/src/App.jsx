import { BrowserRouter } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { TabProvider } from './context/TabContext';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ErrorBoundary>
      <PreferencesProvider>
        <TabProvider>
          <SocketProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </SocketProvider>
        </TabProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  );
}

export default App;