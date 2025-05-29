import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Viewer } from './components/Viewer';
import { InstallPrompt } from './components/InstallPrompt';
import { useTheme } from './hooks/useTheme';

function App() {
  const [isEditor, setIsEditor] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);
  
  // Initialize theme hook to ensure dark class is applied to document
  useTheme();

  useEffect(() => {
    // Determine if we should show editor or viewer based on URL parameters
    const hasDoc = window.location.search.includes('doc=') || window.location.hash.includes('doc=');
    setIsEditor(!hasDoc);
    // Default to reading mode when viewing a document
    setIsReadingMode(hasDoc);
  }, []);

  // Update browser tab title for editor mode
  useEffect(() => {
    if (isEditor) {
      document.title = 'Markdown Document Viewer';
    }
  }, [isEditor]);
  return (
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
    </div>
  );
}

export default App;
