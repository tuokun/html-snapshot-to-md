function format(markdown, options = {}) {
  const {
    metadata = {},
    source = '',
    tags = [],
    imageMap = {},
    imageDir = '附录图',
  } = options;

  let result = '';

  result += generateFrontmatter({ source, tags, metadata });

  result += processImageLinks(markdown, imageMap, imageDir);

  result = adjustHeadings(result);

  result = cleanHeadingLinks(result);

  return result;
}

function generateFrontmatter({ source, tags, metadata }) {
  const lines = ['---'];
  lines.push('cssclasses: []');
  if (tags.length > 0) {
    lines.push('tags:');
    tags.forEach((tag) => lines.push(`  - ${tag}`));
  }
  if (source) {
    lines.push(`source: "${source}"`);
  }
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  lines.push(`整理时间: "${date}"`);
  if (metadata.author) {
    lines.push(`author: "${metadata.author}"`);
  }
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

function processImageLinks(markdown, imageMap, imageDir) {
  let result = markdown;

  const remoteImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  result = result.replace(remoteImageRegex, (match, alt, url) => {
    if (imageMap[url]) {
      return `![[${imageMap[url]}]]`;
    }
    return match;
  });

  for (const [oldPath, newPath] of Object.entries(imageMap)) {
    if (oldPath.startsWith('http://') || oldPath.startsWith('https://')) continue;

    const escapedOld = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(
      new RegExp(`!\\[[^\\]]*\\]\\([^)]*${escapedOld}[^)]*\\)`, 'g'),
      `![[${newPath}]]`
    );
    result = result.replace(
      new RegExp(escapedOld, 'g'),
      newPath
    );
  }

  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    if (src.startsWith('http://') || src.startsWith('https://')) return match;
    if (src.startsWith('[[')) return match;
    return `![[${src}]]`;
  });

  return result;
}

function adjustHeadings(markdown) {
  const lines = markdown.split('\n');
  let minLevel = 6;
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s/);
    if (m) minLevel = Math.min(minLevel, m[1].length);
  }
  const offset = minLevel - 2;
  if (offset <= 0) return markdown;
  return lines
    .map((line) => {
      const m = line.match(/^(#{1,6})\s/);
      if (m) {
        const level = m[1].length;
        const newLevel = Math.max(level - offset, 2);
        return '#'.repeat(newLevel) + line.slice(level);
      }
      return line;
    })
    .join('\n');
}

function cleanHeadingLinks(markdown) {
  return markdown.replace(/^(#{1,6})\s+\[([^\]]+)\]\([^)]*\)/gm, '$1 $2');
}

module.exports = { format, generateFrontmatter, processImageLinks, adjustHeadings, cleanHeadingLinks };
