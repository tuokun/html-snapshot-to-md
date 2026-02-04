# HTML Snapshot to Markdown

An Agent Skill for converting browser-saved HTML files to Markdown documents. It uses Mozilla Readability algorithm to extract clean content, automatically processes images, and generates well-formatted Markdown files.

[中文](../README.md)

## Features

- **Smart Content Extraction**: Uses Mozilla Readability algorithm to extract clean page content, automatically filtering navigation, ads, and other irrelevant elements
- **Automatic Image Management**: Automatically moves images to `images/` folder and updates links
- **Metadata Preservation**: Extracts title, author, excerpt and other metadata
- **Format Conversion**: Preserves tables, lists, code blocks and other structures
- **Chinese Language Support**: Perfectly handles Chinese content and file paths
- **Duplicate Removal**: Automatically identifies and removes duplicate paragraphs

## Use Cases

When you save a webpage from a browser (right-click "Save As"), you get:
- An `.html` file (HTML structure)
- A resource folder with the same name (containing images, CSS, JS, and other resources)

This skill can reassemble these files into a clean Markdown document.

## Usage

### Basic Usage

#### In OpenCode CLI

```bash
opencode skills load html-snapshot-to-md
```

After loading, you can make requests to the agent:

> Convert `NoSQL.html` to Markdown

The agent will automatically:
1. Read the HTML file
2. Find the resource folder with the same name
3. Extract clean content
4. Convert to Markdown format
5. Process images (move to `images/` folder)
6. Generate `.md` file

### Processing Flow

1. **Read HTML**: Use jsdom to create DOM environment
2. **Extract Content**: Use Mozilla Readability to extract main content
3. **Convert Format**: Use Turndown to convert HTML to Markdown
4. **Process Images**: Move images to `images/` folder and update links
5. **Remove Duplicates**: Identify and remove duplicate content
6. **Generate File**: Output Markdown file

### Command Line Usage

```bash
node convert.js <html-file>
```

Examples:
```bash
# Convert a single HTML file
node convert.js NoSQL.html

# Convert file with Chinese path
node convert.js "JavaGuide - 沉浸式阅读中.html"
```

## Installation

### Prerequisites

- Node.js v14 or higher
- npm (usually comes with Node.js)

### Install Dependencies

```bash
npm install
```

## File Structure

After conversion:

```
project/
├── NoSQL.html                          # Original HTML file
├── NoSQL_files/                        # Original resource folder
├── NoSQL.md                           # Generated Markdown file
└── images/                            # Images folder
    ├── NoSQL_img_0.png
    ├── NoSQL_img_1.png
    ├── NoSQL_img_2.png
    └── NoSQL_img_3.png
```

## Markdown Format

The generated Markdown file includes:

- Level 1 heading (extracted from page title)
- Metadata section (author, excerpt, etc.)
- Main content (preserving original structure)
- Image links (automatically updated to relative paths)

### Example Output

```markdown
# NoSQL Basics Summary

**Author:** Guide

**Excerpt:** Summary of NoSQL database basics...

---

## What is NoSQL?

NoSQL (Not Only SQL) refers to non-relational databases...

![](images/NoSQL_img_1.png)

## What's the difference between SQL and NoSQL?

| Data Storage Model | SQL Databases | NoSQL Databases |
|------------------|--------------|----------------|
| Storage | Structured storage | Unstructured storage |
```

## Tech Stack

- **jsdom**: Creates DOM environment in Node.js
- **@mozilla/readability**: Content extraction algorithm from Firefox Reader View
- **turndown**: HTML to Markdown conversion library

## Supported Features

### HTML Element Conversion

- ✅ Headings (`<h1>` to `<h6>`)
- ✅ Paragraphs (`<p>`)
- ✅ Links (`<a href="...">`)
- ✅ Images (`<img src="...">`)
- ✅ Lists (ordered, unordered)
- ✅ Tables (standard tables)
- ✅ Code blocks (preserves syntax highlighting)
- ✅ Blockquotes (`<blockquote>`)
- ✅ Horizontal rules (`<hr>`)

### Code Block Processing

Preserves syntax highlighting information in code blocks:
- HTML: `<code class="language-javascript">` → Markdown: ```javascript```
- Automatically identifies language markers and converts them

### Image Processing

- Automatically detects images in resource folder
- Moves to `images/` folder
- Renames to ordered format (e.g., `NoSQL_img_0.png`)
- Updates image links in Markdown
- Supports Chinese paths and special characters

## Known Limitations

1. **Static HTML Only**: Only supports static HTML from browser "Save As", does not execute JavaScript
2. **Standard Tables**: Complex nested tables may not convert perfectly
3. **Encoding Format**: Assumes HTML uses UTF-8 encoding
4. **Unsupported Pages**:
   - SPA applications (React, Vue, Angular)
   - Client-side rendered content
   - Real-time data fetching
   - Interactive elements (forms, buttons)

## Examples

### Input File

HTML file saved from browser:
```
NoSQL.html (93 KB)
NoSQL_files/
  ├── logo.png
  ├── sql-nosql-tushi.png
  ├── types-of-nosql-datastores.png
  └── gongzhonghao-javaguide.png
```

### Output File

Generated Markdown file:
```
NoSQL.md (6.8 KB)
images/
  ├── NoSQL_img_0.png
  ├── NoSQL_img_1.png
  ├── NoSQL_img_2.png
  └── NoSQL_img_3.png
```

For more examples, see the [examples/](../../.opencode/skills/html-snapshot-to-md/examples/) folder.

## Project Structure

```
html-snapshot-to-md/
├── .gitignore                          # Git ignore configuration
├── LICENSE                            # MIT license
├── package.json                        # Project configuration
├── convert.js                         # Core conversion script
└── .opencode/skills/html-snapshot-to-md/
    ├── SKILL.md                        # Skill documentation
    └── examples/                       # Examples folder
        ├── README.md
        └── example.md
```

## Contributing

Issues and Pull Requests are welcome!

## License

This project is licensed under the MIT License - see [LICENSE](../../LICENSE) file

## Related Projects

- [markdown-image-organizer](https://github.com/tuokun/markdown-image-organizer): Organize and manage images in Markdown documents
