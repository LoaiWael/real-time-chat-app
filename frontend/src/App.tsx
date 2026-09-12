import { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import { useAuth } from '@clerk/react';
import PageLoader from './components/PageLoader';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';

function App() {

  const { isSignedIn, isLoaded } = useAuth();

  const clearAuth = useAuthStore(state => state.clearAuth);
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isCheckingAuth = useAuthStore(state => state.isCheckingAuth);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      checkAuth();
    } else {
      clearAuth();
    }
  }, [isLoaded, isSignedIn, checkAuth, clearAuth]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) return <PageLoader />;

  return (
    <ThemeProvider >
      <WallpaperProvider>
        <Routes>
          <Route path="/" element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </WallpaperProvider>
    </ThemeProvider >
  )
}

export default App

