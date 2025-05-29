import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Viewer } from './components/Viewer';
import { useMarkdown } from './hooks/useMarkdown';

function App() {
  const [isEditor, setIsEditor] = useState(true);
  const { title } = useMarkdown();

  useEffect(() => {
    // Determine if we should show editor or viewer based on URL parameters
    const hasDoc = window.location.search.includes('doc=') || window.location.hash.includes('doc=');
    setIsEditor(!hasDoc);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header isEditor={isEditor} title={title} />
      <main className="flex-1 flex flex-col">
        {isEditor ? <Editor /> : <Viewer />}
      </main>
    </div>
  );
}

export default App;
