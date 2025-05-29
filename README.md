# 📝 Markdown Document Viewer

[![Deploy to GitHub Pages](https://github.com/thomasrohde/markdown-renderer/actions/workflows/deploy.yml/badge.svg)](https://github.com/thomasrohde/markdown-renderer/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen.svg)](https://web.dev/progressive-web-apps/)

> 🚀 **[Live Demo](https://thomasrohde.github.io/markdown-renderer/)** - Try it now!

A modern, fast, and privacy-focused Progressive Web Application for creating, viewing, and sharing Markdown documents instantly through URL encoding. No servers, no databases, no tracking - everything runs entirely in your browser.

![Markdown Document Viewer Screenshot](https://via.placeholder.com/800x400/0969da/ffffff?text=Markdown+Document+Viewer+Screenshot)

## ✨ Features

### 🔥 Core Features
- **📱 Progressive Web App** - Install on any device, works offline
- **🔗 Instant Sharing** - Share documents via URL encoding (no server required)
- **🎨 GitHub-Flavored Markdown** - Full support for tables, code blocks, and more
- **🌙 Dark Mode** - Beautiful dark/light theme support
- **📱 Responsive Design** - Perfect on desktop, tablet, and mobile
- **🔒 Privacy-First** - Everything runs locally, no data collection

### 🛠️ Advanced Features
- **💾 Offline-First** - Full functionality without internet connection
- **🗜️ Smart Compression** - Efficient gzip compression for large documents
- **📋 One-Click Copy** - Copy shareable links instantly
- **👀 Live Preview** - Side-by-side editing and preview
- **🔄 Auto-Save** - Never lose your work
- **📖 Source View** - Toggle between rendered and source view

### 📝 Markdown Support
- Headers, paragraphs, and text formatting
- Lists (ordered, unordered, task lists)
- Code blocks with syntax highlighting
- Tables with proper styling
- Links and images
- Blockquotes and horizontal rules
- Strikethrough and emphasis

## 🚀 Quick Start

### Try Online
Visit **[https://thomasrohde.github.io/markdown-renderer/](https://thomasrohde.github.io/markdown-renderer/)** to start using the app immediately.

### Install as PWA
1. Visit the live demo on your mobile device or desktop
2. Look for the "Install" prompt or add to home screen option
3. Enjoy native app-like experience with offline support

### Local Development

```bash
# Clone the repository
git clone https://github.com/thomasrohde/markdown-renderer.git
cd markdown-renderer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Technology Stack

### Frontend
- **[React 19](https://react.dev/)** - Modern UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Markdown & Processing
- **[Marked](https://marked.js.org/)** - Fast markdown parser
- **[DOMPurify](https://github.com/cure53/DOMPurify)** - XSS protection
- **[Pako](https://github.com/nodeca/pako)** - Gzip compression

### PWA & Performance
- **[Vite PWA](https://vite-pwa-org.netlify.app/)** - PWA capabilities
- **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)** - Local storage
- **Service Worker** - Offline functionality

## 📖 How It Works

### URL Encoding Magic
The app uses an innovative approach to share documents:

1. **Write** your markdown content in the editor
2. **Compress** using gzip compression
3. **Encode** to base64 for URL safety
4. **Share** via query parameter or URL fragment

```
Short documents: ?doc=<base64-encoded-content>
Long documents:  #doc=<base64-encoded-content>
```

### Smart Compression
- Documents up to ~100KB are supported
- Automatic compression reduces URL size by 60-80%
- Fallback to fragment URLs for larger content
- Efficient handling of repeated content

## 🎯 Use Cases

### 📚 Documentation
- Create and share project documentation
- API reference guides
- Quick how-to guides
- Meeting notes and agendas

### 🎓 Education
- Share lecture notes instantly
- Create interactive tutorials
- Distribute assignments
- Collaborative note-taking

### 💼 Professional
- Technical specifications
- Project proposals
- Code snippets with documentation
- Team communication

### 🌐 Content Creation
- Blog post drafts
- README files
- Change logs
- Release notes

## 🛡️ Privacy & Security

- **No Data Collection** - Zero tracking, analytics, or data harvesting
- **Client-Side Only** - All processing happens in your browser
- **XSS Protection** - DOMPurify sanitizes all rendered content
- **No External Dependencies** - Works completely offline
- **Open Source** - Full transparency, inspect the code yourself

## 📱 Browser Support

- **Chrome/Edge** 88+ (full PWA support)
- **Firefox** 84+ (core features)
- **Safari** 14+ (iOS/macOS support)
- **Mobile browsers** - Full responsive support

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### 🐛 Bug Reports
1. Check existing issues first
2. Create a detailed bug report with steps to reproduce
3. Include browser and OS information

### ✨ Feature Requests
1. Search existing feature requests
2. Create a new issue with detailed description
3. Explain the use case and benefits

### 🔧 Development
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper tests
4. Commit with conventional commit messages
5. Push and create a Pull Request

### 📝 Development Guidelines
- Follow TypeScript best practices
- Add proper JSDoc comments
- Ensure responsive design
- Test on multiple browsers
- Keep bundle size minimal

## 📋 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run deploy       # Deploy to GitHub Pages
npm run test         # Run test suite
npm run test:pwa     # Test PWA with Lighthouse
npm run lint         # Run ESLint
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Editor.tsx      # Markdown editor
│   ├── Header.tsx      # App header
│   └── Viewer.tsx      # Document viewer
├── hooks/              # Custom React hooks
│   ├── useEncoding.ts  # URL encoding/decoding
│   └── useMarkdown.ts  # Markdown processing
├── utils/              # Utility functions
│   ├── encoding.ts     # Compression utilities
│   └── markdown.ts     # Markdown rendering
├── config/             # App configuration
│   └── constants.ts    # App constants
└── styles/             # Global styles
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Marked](https://marked.js.org/) for excellent markdown parsing
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Vite](https://vitejs.dev/) for amazing developer experience
- [React](https://react.dev/) team for the fantastic framework

## 🔗 Links

- **Live Demo**: [https://thomasrohde.github.io/markdown-renderer/](https://thomasrohde.github.io/markdown-renderer/)
- **Repository**: [https://github.com/thomasrohde/markdown-renderer](https://github.com/thomasrohde/markdown-renderer)
- **Issues**: [Report bugs or request features](https://github.com/thomasrohde/markdown-renderer/issues)

---

<div align="center">
  <p>Made with ❤️ for the developer community</p>
  <p>
    <a href="https://thomasrohde.github.io/markdown-renderer/">Try it now</a> •
    <a href="https://github.com/thomasrohde/markdown-renderer/issues">Report Bug</a> •
    <a href="https://github.com/thomasrohde/markdown-renderer/issues">Request Feature</a>
  </p>
</div>