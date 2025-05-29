import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Viewer } from './components/Viewer';
import { InstallPrompt } from './components/InstallPrompt';
import { SplashScreen } from './components/SplashScreen';
import { useTheme } from './hooks/useTheme';

function App() {
  const [isEditor, setIsEditor] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Initialize theme hook to ensure dark class is applied to document
  useTheme();

  useEffect(() => {
    // Determine if we should show editor or viewer based on URL parameters
    const hasDoc = window.location.search.includes('doc=') || window.location.hash.includes('doc=');
    setIsEditor(!hasDoc);
    // Default to reading mode when viewing a document
    setIsReadingMode(hasDoc);
    
    // Check if this is a PWA launch or mobile device to show splash
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    
    // Show splash screen on first visit or in PWA mode on mobile
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');
    
    if ((isPWA || isMobile) && !hasSeenSplash) {
      setShowSplash(true);
      localStorage.setItem('hasSeenSplash', 'true');
    } else {
      setShowSplash(false);
    }
  }, []);

  // Update browser tab title for editor mode
  useEffect(() => {
    if (isEditor) {
      document.title = 'Markdown Document Viewer';
    }
  }, [isEditor]);  return (
    <div className={`min-h-screen flex flex-col ${isReadingMode ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900'} max-w-full overflow-hidden`}>
      {(!isEditor && !isReadingMode) && <Header isEditor={isEditor} />}
      {isEditor && <Header isEditor={isEditor} />}
      <main className="flex-1 flex flex-col">
        {isEditor ? (
          <Editor />
        ) : (
          <Viewer 
            isReadingMode={isReadingMode} 
            onToggleReadingMode={() => setIsReadingMode(!isReadingMode)} 
          />
        )}
      </main>
      
      {/* Install PWA Prompt */}
      <InstallPrompt />
      
      {/* Mobile Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
    </div>
  );
}

export default App;
