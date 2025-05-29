import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Viewer } from './components/Viewer';
import { useMarkdown } from './hooks/useMarkdown';

function App() {
  const [isEditor, setIsEditor] = useState(true);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const { title } = useMarkdown();

  useEffect(() => {
    // Determine if we should show editor or viewer based on URL parameters
    const hasDoc = window.location.search.includes('doc=') || window.location.hash.includes('doc=');
    setIsEditor(!hasDoc);
    // Default to reading mode when viewing a document
    setIsReadingMode(hasDoc);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isReadingMode ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900'}`}>
      {(!isEditor && !isReadingMode) && <Header isEditor={isEditor} title={title} />}
      {isEditor && <Header isEditor={isEditor} title={title} />}
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
    </div>
  );
}

export default App;
