module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173/markdown-renderer/'],
      startServerCommand: 'npm run preview',
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:pwa': ['error', { minScore: 1 }],
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
