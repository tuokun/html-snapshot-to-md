# HTML Snapshot to Markdown

Convert web pages (URL or local HTML) to Obsidian-flavored Markdown notes with automatic semantic image management.

[中文](../README.md)

## Features

- **Dual Input Modes**: URL fetching and local HTML file support
- **Smart Content Extraction**: Mozilla Readability algorithm for clean content extraction
- **Obsidian Formatting**: YAML frontmatter, wikilink image embeds, heading offset
- **Semantic Image Naming**: Context-aware image renaming (e.g., `hashtable-chaining.png`)
- **Remote Image Download**: Automatic download of remote images to local storage
- **Deduplication**: Automatic duplicate paragraph removal

## Quick Start

### Install

```bash
npm install
```

### URL Mode

```bash
node convert.js https://example.com --noteName "My Note" --tags "test,example"
```

### Local HTML Mode

```bash
node convert.js saved-page.html --noteName "My Note" --imageDir "images"
```

### Programmatic API

```javascript
const { run } = require('./src/index');

await run({
  input: 'https://example.com',
  noteName: 'MyNote',
  outputDir: '/path/to/output',
  imageDir: 'images',
  tags: ['tag1', 'tag2'],
});
```

## Processing Flow

```
Input → Fetch → Convert → Process Images → Format → Output
                                              │
                                      NoteName.md
                                      images/
                                      ├─ NoteName-desc1.png
                                      └─ NoteName-desc2.png
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--noteName` | Note name | Page title |
| `--imageDir` | Image subdirectory | 附录图 |
| `--outputDir` | Output directory | Current dir |
| `--tags` | Tags (comma-separated) | - |
| `--source` | Source URL | Auto-detected |

## Output Format

```markdown
---
cssclasses: []
tags:
  - algorithm
source: "https://example.com"
整理时间: "2026-04-03"
---

## Title

Content...

![[images/NoteName-imageDescription.png]]
```

## Project Structure

```
html-snapshot-to-md/
├── src/
│   ├── index.js              # Main entry
│   ├── fetcher.js            # Content fetching (URL + local)
│   ├── converter.js          # HTML → Markdown
│   ├── image-handler.js      # Image processing
│   ├── obsidian-formatter.js # Obsidian formatting
│   └── utils.js              # Utilities
├── convert.js                # CLI entry
├── .opencode/skills/html-snapshot-to-md/
│   ├── SKILL.md
│   └── examples/
├── package.json
└── README.md
```

## Tech Stack

- **jsdom**: Node.js DOM environment
- **@mozilla/readability**: Content extraction algorithm
- **turndown**: HTML to Markdown conversion
- **Native https/http**: URL fetching and image download

## Limitations

1. URL mode only supports server-rendered static pages
2. Complex nested tables may not convert perfectly
3. Assumes UTF-8 encoding
4. Failed image downloads are skipped (non-blocking)

## License

MIT
