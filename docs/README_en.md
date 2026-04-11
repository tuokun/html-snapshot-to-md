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

## Install

This project is an [OpenCode](https://opencode.ai) Agent Skill. The entire repo IS the skill — just copy it into your skills directory:

```bash
# Option 1: Project-local (recommended, only applies to current project)
cp -r html-snapshot-to-md/ /path/to/project/.opencode/skills/

# Option 2: Global (available in all projects)
cp -r html-snapshot-to-md/ ~/.config/opencode/skills/

# Option 3: Claude Code compatible
cp -r html-snapshot-to-md/ /path/to/project/.claude/skills/
```

After copying, install dependencies:

```bash
cd /path/to/skills/html-snapshot-to-md/
npm install
```

> You can also use `git clone` instead of `cp -r` for easy updates via `git pull`.

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
├── SKILL.md                # Skill definition (auto-discovered by OpenCode)
├── src/                    # Source code
│   ├── index.js            # Main entry
│   ├── fetcher.js          # Content fetching (URL + local)
│   ├── converter.js        # HTML → Markdown
│   ├── image-handler.js    # Image processing
│   ├── obsidian-formatter.js # Obsidian formatting
│   └── utils.js            # Utilities
├── convert.js              # CLI entry
├── package.json
├── examples/
├── README.md
├── docs/README_en.md
└── LICENSE
```

## CLI Usage

```bash
node convert.js <html-file-or-url> [options]
```

Options:
- `--noteName <name>` Note name
- `--imageDir <dir>` Image subdirectory (default: 附录图)
- `--outputDir <dir>` Output directory
- `--tags <tag1,tag2>` Tags
- `--source <url>` Source URL

## Limitations

1. URL mode only supports server-rendered static pages
2. Complex nested tables may not convert perfectly
3. Assumes UTF-8 encoding
4. Failed image downloads are skipped (non-blocking)

## License

MIT
