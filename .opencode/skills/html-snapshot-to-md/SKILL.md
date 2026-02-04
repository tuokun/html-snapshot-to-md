---
name: html-snapshot-to-md
description: Convert browser-saved HTML files to Markdown with intelligent image management
version: "1.0.0"
---

# HTML Snapshot to Markdown Skill

This skill enables agents to convert HTML files saved from browsers (using "Save As" feature) into clean, well-structured Markdown documents with automatic image organization.

## Overview

When users save a webpage using browser's "Save As" feature, they get:
- An `.html` file containing the webpage's structure
- A同名 resource folder containing images, CSS, JavaScript, and other assets

This skill helps:
- Extract clean content from the HTML (removing navigation, ads, etc.)
- Convert HTML to Markdown format
- Move images to an organized `images/` folder
- Update image links in the Markdown
- Extract metadata (title, author, etc.)
- Preserve code blocks with syntax highlighting
- Handle tables and other structured content

## Prerequisites

Before using this skill, verify:
1. Node.js is installed (v14 or later recommended)
2. The HTML file exists
3. The corresponding resource folder exists (if the page has images)
4. Required npm packages are installed: `@mozilla/readability`, `jsdom`, `turndown`

### Installation

```bash
npm install @mozilla/readability jsdom turndown
```

## Usage Scenarios

Use this skill when:
- User wants to convert a browser-saved HTML file to Markdown
- User needs to extract clean content from a webpage
- User wants to organize images from a saved webpage
- User needs to preserve code blocks with syntax highlighting
- User wants to convert tables to Markdown format

## Step-by-Step Process

### Step 1: Locate HTML and Resource Folder

First, identify the input files:
- HTML file (e.g., `article.html`)
- Resource folder (e.g., `article_files/`)

```bash
# Check if resource folder exists
ls -la "JavaGuide - 沉浸式阅读中_files/"
```

### Step 2: Read and Parse HTML

Use `jsdom` to create a DOM environment from the HTML:

```javascript
const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('article.html', 'utf8');
const dom = new JSDOM(html, {
  url: 'file://' + __dirname + '/'
});
```

### Step 3: Extract Clean Content with Readability

Use `@mozilla/readability` to extract the main content:

```javascript
const { Readability } = require('@mozilla/readability');

const article = new Readability(dom.window.document).parse();

if (!article) {
  throw new Error('Could not extract article content');
}

// Extract metadata
const metadata = {
  title: article.title,
  author: article.byline,
  publishedTime: article.publishedTime,
  excerpt: article.excerpt
};
```

### Step 4: Configure Turndown Converter

Set up the HTML to Markdown converter with custom rules:

```javascript
const TurndownService = require('turndown');

const turndownService = new TurndownService({
  headingStyle: 'atx',           // Use # style headings
  codeBlockStyle: 'fenced',      // Use ``` code blocks
  bulletListMarker: '-',         // Use - for bullets
  emDelimiter: '*',              // Use * for emphasis
  strongDelimiter: '**'          // Use ** for bold
});

// Custom rule for code blocks with syntax highlighting
turndownService.addRule('codeBlock', {
  filter: function(node) {
    return node.nodeName === 'PRE';
  },
  replacement: function(content, node) {
    const codeElement = node.querySelector('code');
    const className = codeElement?.className || '';
    const langMatch = className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1] : '';
    return '\n```' + lang + '\n' + content + '\n```\n';
  }
});

// Custom rule for preserving tables
turndownService.addRule('table', {
  filter: ['table'],
  replacement: function(content, node) {
    return '\n' + content + '\n';
  }
});
```

### Step 5: Convert HTML to Markdown

```javascript
let markdown = '# ' + metadata.title + '\n\n';

// Add metadata if available
if (metadata.author) {
  markdown += `**作者:** ${metadata.author}\n\n`;
}
if (metadata.publishedTime) {
  markdown += `**发布时间:** ${metadata.publishedTime}\n\n`;
}
if (metadata.excerpt) {
  markdown += `**摘要:** ${metadata.excerpt}\n\n`;
}

markdown += '---\n\n';
markdown += turndownService.turndown(article.content);
```

### Step 6: Remove Duplicate Content

Check for and remove duplicate paragraphs:

```javascript
function removeDuplicates(markdown) {
  const paragraphs = markdown.split(/\n\n+/);
  const seen = new Set();
  const unique = [];

  for (const para of paragraphs) {
    const normalized = para.trim().replace(/\s+/g, ' ');
    const hash = require('crypto')
      .createHash('md5')
      .update(normalized)
      .digest('hex');

    if (!seen.has(hash) && normalized.length > 10) {
      seen.add(hash);
      unique.push(para);
    }
  }

  return unique.join('\n\n');
}

markdown = removeDuplicates(markdown);
```

### Step 7: Process Images

Extract image references, move them to `images/` folder, and update links:

```javascript
const path = require('path');
const fs = require('fs');

function processImages(htmlPath, markdown, resourceFolder) {
  const htmlDir = path.dirname(htmlPath);
  const htmlFile = path.basename(htmlPath, '.html');
  const imagesDir = path.join(htmlDir, 'images');

  // Create images directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Find all image references in HTML
  const dom = new JSDOM(fs.readFileSync(htmlPath, 'utf8'));
  const images = dom.window.document.querySelectorAll('img');

  const imageMap = {};

  images.forEach((img, index) => {
    const src = img.getAttribute('src');
    if (!src || src.startsWith('http')) return;

    // Handle relative paths from resource folder
    let imagePath;
    if (resourceFolder) {
      // Image is in resource folder
      imagePath = path.join(htmlDir, resourceFolder, path.basename(src));
    } else {
      // Image is relative to HTML
      imagePath = path.join(htmlDir, src);
    }

    if (fs.existsSync(imagePath)) {
      const ext = path.extname(src);
      const newName = `${htmlFile}_img_${index}${ext}`;
      const newPath = path.join(imagesDir, newName);

      // Copy image to images folder
      fs.copyFileSync(imagePath, newPath);

      // Store mapping
      imageMap[src] = `images/${newName}`;
    }
  });

  // Update markdown with new image paths
  let updatedMarkdown = markdown;
  for (const [oldPath, newPath] of Object.entries(imageMap)) {
    updatedMarkdown = updatedMarkdown.replace(
      new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      newPath
    );
  }

  return updatedMarkdown;
}

// Determine resource folder name
const resourceFolder = htmlFile + '_files';
markdown = processImages(htmlPath, markdown, resourceFolder);
```

### Step 8: Write Markdown File

```javascript
const outputPath = path.join(htmlDir, htmlFile + '.md');
fs.writeFileSync(outputPath, markdown, 'utf8');

console.log(`Markdown file created: ${outputPath}`);
```

## Complete Workflow Example

```javascript
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const TurndownService = require('turndown');

async function convertHTMLToMarkdown(htmlPath) {
  // Step 1: Read HTML
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html, {
    url: 'file://' + path.resolve(path.dirname(htmlPath)) + '/'
  });

  // Step 2: Extract content
  const article = new Readability(dom.window.document).parse();
  if (!article) {
    throw new Error('Could not extract article content');
  }

  // Step 3: Configure converter
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });

  // Add custom rules
  turndownService.addRule('codeBlock', {
    filter: (node) => node.nodeName === 'PRE',
    replacement: (content, node) => {
      const code = node.querySelector('code');
      const className = code?.className || '';
      const langMatch = className.match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      return `\n\`\`\`${lang}\n${content}\n\`\`\`\n`;
    }
  });

  // Step 4: Convert
  let markdown = `# ${article.title}\n\n`;
  markdown += turndownService.turndown(article.content);

  // Step 5: Remove duplicates
  markdown = removeDuplicates(markdown);

  // Step 6: Process images
  const htmlDir = path.dirname(htmlPath);
  const htmlFile = path.basename(htmlPath, '.html');
  const resourceFolder = htmlFile + '_files';
  markdown = processImages(htmlPath, markdown, resourceFolder);

  // Step 7: Write output
  const outputPath = path.join(htmlDir, htmlFile + '.md');
  fs.writeFileSync(outputPath, markdown, 'utf8');

  return outputPath;
}
```

## Supported HTML Features

### Headings
- Converts `<h1>` to `<h6>` to `#` to `######` style
- Extracts main title for first heading

### Paragraphs
- Converts `<p>` to Markdown paragraphs with proper spacing

### Links
- Converts `<a href="...">` to `[text](url)` format

### Images
- Converts `<img src="...">` to `![alt](path)` format
- Moves images to `images/` folder
- Updates relative paths

### Code Blocks
- Preserves syntax highlighting information
- Converts `class="language-xxx"` to ` ```xxx `

### Tables
- Converts standard HTML tables to Markdown tables
- Supports headers (`<th>`) and cells (`<td>`)

### Lists
- Converts ordered and unordered lists
- Supports nested lists

### Blockquotes
- Converts `<blockquote>` to `>` style blockquotes

### Horizontal Rules
- Converts `<hr>` to `---`

## Best Practices

### File Naming
- Use descriptive names for HTML files
- Avoid special characters in filenames
- Keep resource folders with the default naming convention

### Image Organization
- Images are automatically moved to `images/` folder
- Original resource folder may be left empty after conversion
- Images are renamed to avoid conflicts (e.g., `article_img_0.png`)

### Error Handling
Always verify:
1. The HTML file exists and is readable
2. The resource folder exists (if images are referenced)
3. Readability can extract content
4. Images can be copied to new location
5. The markdown file is written successfully

## Limitations

### Known Limitations
1. **Static HTML Only**: Does not execute JavaScript
2. **Standard Tables**: Complex nested tables may not convert perfectly
3. **Encoding**: Assumes UTF-8 encoding
4. **Dynamic Content**: Cannot handle content loaded dynamically via JavaScript
5. **IFrames**: Content in iframes is not processed

### Not Supported
- SPA applications (React, Vue, Angular)
- Client-side rendered content
- Real-time data fetching
- Interactive elements (forms, buttons)

## Troubleshooting

### Issue: Could not extract article content

**Cause**: The HTML content is not suitable for Readability extraction

**Solution**:
1. Check if the HTML has meaningful content
2. Verify the HTML is from a complete webpage, not a partial view
3. Try with a different webpage

### Issue: Images not found

**Cause**: Images are not in the expected location

**Solution**:
1. Check the resource folder name matches the HTML file name
2. Verify images exist in the resource folder
3. Check HTML for absolute URLs (http/https) which won't be copied

### Issue: Broken image links in Markdown

**Cause**: Image path conversion failed

**Solution**:
1. Verify the `images/` folder was created
2. Check if images were copied successfully
3. Ensure relative paths are correct

### Issue: Code blocks lose syntax highlighting

**Cause**: HTML doesn't contain language classes

**Solution**:
1. Check the original HTML for `class="language-xxx"` attributes
2. Some sites don't include syntax highlighting information
3. Manual editing may be required

### Issue: Chinese characters display incorrectly

**Cause**: File encoding mismatch

**Solution**:
1. Ensure HTML file is saved with UTF-8 encoding
2. Use `utf8` encoding when reading/writing files
3. Check the HTML's `<meta charset="utf-8">` declaration

## Example Session

**User Request:**
"Convert NoSQL.html to Markdown"

**Agent Actions:**
1. Read `NoSQL.html`
2. Find `NoSQL_files/` resource folder
3. Use Readability to extract clean content
4. Configure Turndown with custom rules
5. Convert HTML to Markdown
6. Remove duplicate paragraphs
7. Move images to `images/` folder
8. Write `NoSQL.md`
9. Display conversion summary

**Output:**
```
✓ Converted NoSQL.html to NoSQL.md
✓ Extracted 15 paragraphs
✓ Moved 5 images to images/ folder
✓ Preserved 3 code blocks with syntax highlighting
```

## Related Skills

- **markdown-image-organizer**: For organizing images in existing Markdown files
- **obsidian-markdown**: For Obsidian-specific Markdown features

## References

- [Mozilla Readability](https://github.com/mozilla/readability)
- [Turndown Documentation](https://github.com/mixmark-io/turndown)
- [jsdom Documentation](https://github.com/jsdom/jsdom)
- [CommonMark Spec](https://commonmark.org/)
