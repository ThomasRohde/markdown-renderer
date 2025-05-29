import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  compressed: string;
  createdAt: Date;
  lastViewedAt: Date;
  isFavorite: boolean;
  size: number;
}

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  editorSettings: {
    wordWrap: boolean;
    lineNumbers: boolean;
  };
}

interface MarkdownViewerDB extends DBSchema {
  documents: {
    key: string;
    value: DocumentRecord;
    indexes: {
      'by-lastViewed': Date;
      'by-created': Date;
      'by-title': string;
    };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

class Storage {
  private db: IDBPDatabase<MarkdownViewerDB> | null = null;

  async init(): Promise<void> {
    this.db = await openDB<MarkdownViewerDB>('markdown-viewer', 2, {
      upgrade(db) {
        // Documents store
        const documentsStore = db.createObjectStore('documents', {
          keyPath: 'id',
        });
        documentsStore.createIndex('by-lastViewed', 'lastViewedAt');
        documentsStore.createIndex('by-created', 'createdAt');
        documentsStore.createIndex('by-title', 'title');        // Settings store
        db.createObjectStore('settings');
      },
    });
  }

  // Document operations
  async saveDocument(doc: Omit<DocumentRecord, 'id' | 'createdAt' | 'lastViewedAt'>): Promise<string> {
    if (!this.db) await this.init();
    
    const id = crypto.randomUUID();
    const now = new Date();
    
    const document: DocumentRecord = {
      ...doc,
      id,
      createdAt: now,
      lastViewedAt: now,
    };

    await this.db!.put('documents', document);
    return id;
  }

  async getDocument(id: string): Promise<DocumentRecord | null> {
    if (!this.db) await this.init();
    return (await this.db!.get('documents', id)) || null;
  }

  async updateDocumentLastViewed(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    const doc = await this.getDocument(id);
    if (doc) {
      doc.lastViewedAt = new Date();
      await this.db!.put('documents', doc);
    }
  }

  async toggleFavorite(id: string): Promise<boolean> {
    if (!this.db) await this.init();
    
    const doc = await this.getDocument(id);
    if (doc) {
      doc.isFavorite = !doc.isFavorite;
      await this.db!.put('documents', doc);
      return doc.isFavorite;
    }
    return false;
  }

  async getRecentDocuments(limit = 50): Promise<DocumentRecord[]> {
    if (!this.db) await this.init();
    
    const tx = this.db!.transaction('documents', 'readonly');
    const index = tx.store.index('by-lastViewed');
    const documents = await index.getAll();
    
    return documents
      .sort((a, b) => b.lastViewedAt.getTime() - a.lastViewedAt.getTime())
      .slice(0, limit);
  }

  async getFavoriteDocuments(): Promise<DocumentRecord[]> {
    if (!this.db) await this.init();
    
    const documents = await this.db!.getAll('documents');
    return documents.filter(doc => doc.isFavorite);
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('documents', id);
  }

  async searchDocuments(query: string): Promise<DocumentRecord[]> {
    if (!this.db) await this.init();
    
    const documents = await this.db!.getAll('documents');
    const searchLower = query.toLowerCase();
    
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(searchLower) ||
      doc.content.toLowerCase().includes(searchLower)
    );
  }  // Settings operations
  async getSettings(): Promise<AppSettings> {
    if (!this.db) await this.init();
    
    const settings = await this.db!.get('settings', 'app-settings');
    return settings || {
      theme: 'system',
      fontSize: 16,
      editorSettings: {
        wordWrap: true,
        lineNumbers: false,
      },
    };
  }
  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.db) await this.init();
    
    await this.db!.put('settings', settings, 'app-settings');
  }

  // Cleanup old documents (keep last 50 viewed)
  async cleanup(): Promise<void> {
    if (!this.db) await this.init();
    
    const documents = await this.getRecentDocuments(100);
    if (documents.length > 50) {
      const toDelete = documents.slice(50);
      const tx = this.db!.transaction('documents', 'readwrite');
      
      for (const doc of toDelete) {
        if (!doc.isFavorite) {
          await tx.store.delete(doc.id);
        }
      }
    }
  }
}

export const storage = new Storage();
export type { DocumentRecord, AppSettings };
