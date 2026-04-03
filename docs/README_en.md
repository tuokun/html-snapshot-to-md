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

This project is an [OpenCode](https://opencode.ai) Skill. Install it into your Obsidian vault:

```bash
# 1. Copy the skill directory to your vault's .opencode/skills/
cp -r .opencode/skills/html-snapshot-to-md/ /path/to/vault/.opencode/skills/

# 2. Install dependencies
cd /path/to/vault/.opencode/skills/html-snapshot-to-md/
npm install
```

### Usage

Once installed, simply chat in OpenCode to trigger the skill, e.g.:

- "Convert this webpage to a note: https://example.com/..."
- "Convert this HTML file to an Obsidian note, put images in the images folder"

## Processing Flow

```
Input → Fetch → Convert → Process Images → Format → Output
                                              │
                                      NoteName.md
                                      images/
                                      ├─ NoteName-desc1.png
                                      └─ NoteName-desc2.png
```

## Configuration

Specify via conversation or the programmatic API in SKILL.md:

| Option | Description | Default |
|--------|-------------|---------|
| `noteName` | Note name | Page title |
| `imageDir` | Image subdirectory | 附录图 |
| `outputDir` | Output directory | Current dir |
| `tags` | Tags array | - |
| `source` | Source URL | Auto-detected |

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
├── src/                        # Development source
│   ├── index.js              # Main entry
│   ├── fetcher.js            # Content fetching (URL + local)
│   ├── converter.js          # HTML → Markdown
│   ├── image-handler.js      # Image processing
│   ├── obsidian-formatter.js # Obsidian formatting
│   └── utils.js              # Utilities
├── convert.js                  # CLI entry
├── package.json
├── README.md
├── docs/README_en.md
├── LICENSE
└── .opencode/skills/html-snapshot-to-md/   # Self-contained Skill directory (copy to distribute)
    ├── SKILL.md                # Skill documentation
    ├── convert.js              # CLI entry (copy)
    ├── package.json            # Dependencies (copy)
    ├── src/                    # Source code (copy)
    │   ├── index.js
    │   ├── fetcher.js
    │   ├── converter.js
    │   ├── image-handler.js
    │   ├── obsidian-formatter.js
    │   └── utils.js
    └── examples/
```

### Install as Obsidian Skill

Copy the `.opencode/skills/html-snapshot-to-md/` directory into your target vault's `.opencode/skills/`, then run:

```bash
cd /path/to/vault/.opencode/skills/html-snapshot-to-md/
npm install
```



## Limitations

1. URL mode only supports server-rendered static pages
2. Complex nested tables may not convert perfectly
3. Assumes UTF-8 encoding
4. Failed image downloads are skipped (non-blocking)

## License

MIT
