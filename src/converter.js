const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const TurndownService = require('turndown');
const { tables } = require('turndown-plugin-gfm');

function convert(rawData) {
  const { html } = rawData;

  const preservedHtml = html.replace(
    /<pre[^>]*>([\s\S]*?)<code[^>]*class="language-(\w+)"[^>]*>/g,
    (match, inner, lang) => {
      return `<pre data-lang="${lang}">${inner}<code class="language-${lang}">`;
    }
  );

  const dom = new JSDOM(preservedHtml, {
    url: rawData.url || rawData.path || 'file:///',
  });

  const document = dom.window.document;

  document.querySelectorAll('nav, aside, footer, .sidebar, .header, .navbar, .page-nav, .page-footer').forEach((el) => {
    el.remove();
  });

  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.querySelectorAll('.header-anchor').forEach((anchor) => {
      anchor.remove();
    });
  });

  const article = new Readability(document).parse();
  if (!article) {
    throw new Error('Could not extract article content');
  }

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
  });

  turndownService.use(tables);

  turndownService.addRule('codeBlock', {
    filter: (node) => node.nodeName === 'PRE',
    replacement: (content, node) => {
      const code = node.querySelector('code');
      const className = code?.className || '';
      const langMatch = className.match(/language-(\w+)/);
      let lang = langMatch ? langMatch[1] : '';
      if (!lang) {
        lang = node.getAttribute('data-lang') || '';
      }
      const codeContent = code?.textContent || node.textContent;
      return `\n\`\`\`${lang}\n${codeContent.trim()}\n\`\`\`\n`;
    },
  });

  const markdown = turndownService.turndown(article.content);
  const images = extractImages(document);

  return {
    title: article.title || rawData.title,
    markdown,
    images,
    metadata: {
      author: article.byline || '',
      excerpt: article.excerpt || '',
      publishedTime: article.publishedTime || '',
    },
  };
}

function extractImages(document) {
  const images = [];
  const imgElements = document.querySelectorAll('img');

  imgElements.forEach((img, index) => {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (!src) return;

    const alt = img.getAttribute('alt') || '';
    let context = '';

    if (alt && alt.length > 1 && !alt.match(/^(Image|image|图片|图)\s*\d+$/)) {
      context = alt;
    } else {
      const heading = img.closest('h1, h2, h3, h4, h5, h6');
      if (heading) {
        context = heading.textContent.trim();
      }

      if (!context) {
        let node = img.previousSibling;
        while (node) {
          if (node.nodeType === 3 && node.textContent.trim()) {
            context = node.textContent.trim().substring(0, 50);
            break;
          }
          if (node.nodeType === 1 && node.textContent.trim()) {
            context = node.textContent.trim().substring(0, 50);
            break;
          }
          node = node.previousSibling;
        }
      }

      if (!context && img.parentElement) {
        const parentText = img.parentElement.textContent.trim();
        if (parentText.length > 0 && parentText.length < 200) {
          context = parentText.substring(0, 50);
        }
      }
    }

    if (!context) {
      context = `图${index + 1}`;
    }

    const isRemote = src.startsWith('http://') || src.startsWith('https://');
    images.push({
      src,
      alt,
      context,
      isRemote,
      index,
    });
  });

  return images;
}

module.exports = { convert };
