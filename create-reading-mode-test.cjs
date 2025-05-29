const { encode } = require('./src/utils/encoding.ts');

const testMarkdown = `# The Art of Reading: A Digital Renaissance

*An exploration of how modern technology transforms the written word*

## Introduction

In our digital age, the way we consume written content has undergone a dramatic transformation. The transition from physical books to digital screens has not merely changed the medium—it has fundamentally altered our relationship with text itself.

### The Evolution of Reading

Reading has always been more than the mere decoding of symbols. It is:

- **A cognitive process** that engages multiple areas of the brain
- **A cultural practice** that shapes and is shaped by society
- **An intimate experience** between reader and author
- **A gateway to knowledge** across all human endeavors

## The Digital Revolution

> "The real question is not whether machines think but whether men do." — B.F. Skinner

The advent of digital reading platforms has introduced unprecedented capabilities:

1. **Instant access** to vast libraries of content
2. **Interactive elements** that enhance comprehension
3. **Personalization** through adaptive interfaces
4. **Social features** that connect readers globally

### Technical Considerations

Modern reading applications must balance several factors:

\`\`\`typescript
interface ReadingExperience {
  typography: TypographySettings;
  layout: LayoutConfiguration;
  interactivity: InteractionMode;
  accessibility: AccessibilityFeatures;
}
\`\`\`

The code above represents the complexity hidden beneath seemingly simple reading interfaces.

## Design Philosophy

Great reading experiences share common characteristics:

| Principle | Description | Impact |
|-----------|-------------|---------|
| Clarity | Clean, uncluttered design | Reduces cognitive load |
| Focus | Minimal distractions | Enhances comprehension |
| Comfort | Ergonomic considerations | Enables longer reading sessions |
| Adaptability | Responsive to user preferences | Personalizes the experience |

### The Importance of White Space

White space, or negative space, plays a crucial role in readable design. It:

- Provides visual rest for the eyes
- Creates hierarchy and organization
- Improves text legibility
- Reduces visual overwhelm

## Conclusion

As we continue to innovate in the digital reading space, we must remember that technology should serve the fundamental human need for story, knowledge, and connection. The best reading experiences are those that disappear, allowing the content to shine through unimpeded.

The future of reading lies not in choosing between digital and analog, but in thoughtfully combining the best of both worlds to create experiences that honor the sacred act of reading while embracing the possibilities of our connected age.

---

*This document serves as a demonstration of reading mode capabilities, showcasing various markdown elements in a clean, focused environment.*`;

async function createTestUrl() {
  try {
    const encoded = await encode(testMarkdown);
    const baseUrl = 'http://localhost:5173/markdown-renderer/';
    const testUrl = `${baseUrl}?doc=${encodeURIComponent(encoded)}`;
    
    console.log('='.repeat(80));
    console.log('READING MODE TEST DOCUMENT');
    console.log('='.repeat(80));
    console.log('📖 Test URL for Reading Mode:');
    console.log(testUrl);
    console.log('');
    console.log('🎯 Features to test:');
    console.log('- Page loads in reading mode by default');
    console.log('- Clean, distraction-free reading experience');
    console.log('- App icon (M) in upper right corner');
    console.log('- Click icon to reveal full app controls');
    console.log('- Click "Reading Mode" to return to minimal view');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Error creating test URL:', error);
  }
}

createTestUrl();
