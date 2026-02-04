const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const TurndownService = require('turndown');

/**
 * Remove duplicate paragraphs from markdown
 */
function removeDuplicates(markdown) {
  const paragraphs = markdown.split(/\n\n+/);
  const seen = new Set();
  const unique = [];

  for (const para of paragraphs) {
    const normalized = para.trim().replace(/\s+/g, ' ');
    if (normalized.length > 10) {
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(normalized).digest('hex');

      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(para);
      }
    } else if (normalized.length > 0) {
      unique.push(para);
    }
  }

  return unique.join('\n\n');
}

/**
 * Process images: move to images/ folder and return path mappings
 */
function processImages(htmlPath, markdown, resourceFolder) {
  const htmlDir = path.dirname(htmlPath);
  const htmlFile = path.basename(htmlPath, '.html');
  const imagesDir = path.join(htmlDir, 'images');

  // Create images directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Find all image references in HTML
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const images = dom.window.document.querySelectorAll('img');

  const imageMap = {};
  let imageCount = 0;

  console.log(`Found ${images.length} images in HTML`);

  images.forEach((img, index) => {
    const src = img.getAttribute('src');
    if (!src) return;

    // Skip remote images
    if (src.startsWith('http://') || src.startsWith('https://')) {
      console.log(`  Skipping remote image: ${src}`);
      return;
    }

    // Determine image path
    let imagePath;

    if (resourceFolder) {
      // Image is in resource folder
      imagePath = path.join(htmlDir, resourceFolder, path.basename(src));
    } else {
      // Image is relative to HTML
      imagePath = path.join(htmlDir, src);
    }

    // Check if image exists
    if (fs.existsSync(imagePath)) {
      imageCount++;
      const ext = path.extname(src);
      const newName = `${htmlFile}_img_${index}${ext}`;
      const newPath = path.join(imagesDir, newName);

      try {
        fs.copyFileSync(imagePath, newPath);
        console.log(`  ✓ Copied: ${path.basename(src)} → ${newName}`);

        // Store mapping for all possible path formats
        // Map original src to new path
        imageMap[src] = `images/${newName}`;

        // Also map the basename
        imageMap[path.basename(src)] = `images/${newName}`;

        // Map absolute file:// URLs if they appear
        const absolutePath = path.resolve(imagePath).replace(/\\/g, '/');
        imageMap[`file:///${absolutePath}`] = `images/${newName}`;

        // Also map URL-encoded version (for paths with spaces and special characters)
        const encodedPath = encodeURIComponent(absolutePath);
        imageMap[`file:///${encodedPath}`] = `images/${newName}`;
        imageMap[encodedPath] = `images/${newName}`;
      } catch (err) {
        console.error(`  ✗ Failed to copy ${imagePath}: ${err.message}`);
      }
    } else {
      console.log(`  ⚠ Image not found: ${imagePath}`);
    }
  });

    console.log(`Moved ${imageCount} images to images/ folder`);

    return imageMap;
}

/**
 * Convert HTML file to Markdown
 */
async function convertHTMLToMarkdown(htmlPath) {
  console.log(`\n=== Converting ${htmlPath} ===\n`);

  // Validate input file
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`HTML file not found: ${htmlPath}`);
  }

  const htmlFile = path.basename(htmlPath, '.html');
  const htmlDir = path.dirname(htmlPath);
  const resourceFolder = path.join(htmlDir, htmlFile + '_files');

  console.log(`HTML File: ${htmlPath}`);
  console.log(`Resource Folder: ${resourceFolder}`);

  // Step 1: Read HTML
  console.log('\n[1/6] Reading HTML file...');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Step 2: Create DOM
  console.log('[2/6] Creating DOM...');
  const dom = new JSDOM(html, {
    url: 'file://' + path.resolve(htmlDir) + '/'
  });

  // Step 3: Extract content with Readability
  console.log('[3/6] Extracting clean content...');

  // Pre-process: Store original image paths before Readability converts them
  const images = dom.window.document.querySelectorAll('img');
  const imagePaths = new Map();
  images.forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http')) {
      imagePaths.set(img, { src, index });
    }
  });

  const article = new Readability(dom.window.document).parse();

  if (!article) {
    throw new Error('Could not extract article content. The HTML may not contain readable content.');
  }

  console.log(`  ✓ Title: ${article.title}`);
  console.log(`  ✓ Content length: ${article.content.length} characters`);
  console.log(`  ✓ Excerpt: ${article.excerpt?.substring(0, 100) || 'N/A'}...`);

  // Step 4: Configure Turndown converter
  console.log('[4/6] Configuring Markdown converter...');
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**'
  });

  // Custom rule for code blocks with syntax highlighting
  turndownService.addRule('codeBlock', {
    filter: (node) => node.nodeName === 'PRE',
    replacement: (content, node) => {
      const code = node.querySelector('code');
      const className = code?.className || '';
      const langMatch = className.match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      const codeContent = code?.textContent || node.textContent;
      return `\n\`\`\`${lang}\n${codeContent.trim()}\n\`\`\`\n`;
    }
  });

  // Custom rule for better table handling
  turndownService.addRule('table', {
    filter: ['table'],
    replacement: (content, node) => {
      return '\n' + content + '\n';
    }
  });

  // Step 5: Convert to Markdown
  console.log('[5/6] Converting to Markdown...');
  let markdown = `# ${article.title}\n\n`;

  // Add metadata
  if (article.byline) {
    markdown += `**作者:** ${article.byline}\n\n`;
  }
  if (article.publishedTime) {
    markdown += `**发布时间:** ${article.publishedTime}\n\n`;
  }
  if (article.excerpt) {
    markdown += `**摘要:** ${article.excerpt}\n\n`;
  }

  if (article.byline || article.publishedTime || article.excerpt) {
    markdown += '---\n\n';
  }

  markdown += turndownService.turndown(article.content);

  // Step 6: Remove duplicates
  console.log('[6/6] Processing images and removing duplicates...');
  markdown = removeDuplicates(markdown);

  // Process images
  if (fs.existsSync(resourceFolder)) {
    const imageMap = processImages(htmlPath, markdown, path.basename(resourceFolder));

    // Update markdown with new image paths
    // Create a filename mapping for simpler matching
    const filenameMap = {};
    for (const [oldPath, newPath] of Object.entries(imageMap)) {
      const oldFilename = oldPath.split('/').pop();
      filenameMap[oldFilename] = newPath.split('/').pop();
    }

    let replaced = 0;
    for (const [oldPath, newPath] of Object.entries(imageMap)) {
      // Skip non-file paths, we'll replace absolute file:// paths
      if (!oldPath.startsWith('file:///')) {
        continue;
      }

      // Extract filename from old path for URL-encoded matching
      const oldFilename = oldPath.split('/').pop();
      const newFilename = newPath.split('/').pop();

      // Try replacing by filename as a fallback
      const escapedFilename = oldFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      markdown = markdown.replace(new RegExp(escapedFilename, 'g'), newFilename);

      // Decode oldPath to handle URL-encoded characters
      const decodedPath = decodeURIComponent(oldPath);

      // Try to replace both encoded and decoded versions
      const escapedPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedDecoded = decodedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const before = markdown;
      markdown = markdown.replace(new RegExp(escapedPath, 'g'), newPath);
      if (markdown !== before) replaced++;

      markdown = markdown.replace(new RegExp(escapedDecoded, 'g'), newPath);
      if (markdown !== before) replaced++;
    }

    // Also replace the full directory path pattern for images
    // Pattern: file:///D:/.../JavaGuide%20-%20..._files/
    const dirPattern = new RegExp(`file://[^_]+_files/`, 'g');
    markdown = markdown.replace(dirPattern, 'images/');

    console.log(`Replaced ${replaced} image paths`);
  } else {
    console.log('  Resource folder not found, skipping image processing');
  }

  // Write output
  const outputPath = path.join(htmlDir, htmlFile + '.md');
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log(`\n✓ Markdown file created: ${outputPath}`);
  console.log(`✓ File size: ${(markdown.length / 1024).toFixed(2)} KB\n`);

  return outputPath;
}

// Main execution
(async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node convert.js <html-file>');
    console.log('\nExample: node convert.js NoSQL.html');
    process.exit(1);
  }

  const htmlFile = args[0];

  try {
    const outputPath = await convertHTMLToMarkdown(htmlFile);
    console.log('=== Conversion complete ===');
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}\n`);
    process.exit(1);
  }
})();
