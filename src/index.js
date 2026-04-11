const fs = require('fs');
const path = require('path');
const { fetchFromUrl, fetchFromLocal } = require('./fetcher');
const { convert } = require('./converter');
const { processImages } = require('./image-handler');
const { format } = require('./obsidian-formatter');
const { removeDuplicates, ensureDir } = require('./utils');

async function run(options) {
  const {
    input,
    mode = 'auto',
    outputDir,
    noteName,
    imageDir = '附录图',
    source = '',
    tags = [],
  } = options;

  const isUrl = input.startsWith('http://') || input.startsWith('https://');
  const resolvedMode = mode === 'auto' ? (isUrl ? 'url' : 'local') : mode;

  const rawData = resolvedMode === 'url'
    ? await fetchFromUrl(input)
    : fetchFromLocal(input);

  const resolvedSource = source || (resolvedMode === 'url' ? input : '');
  const resolvedNoteName = noteName || rawData.title || 'untitled';
  const resolvedOutputDir = outputDir || (rawData.htmlDir || process.cwd());

  const { title, markdown, images, metadata } = convert(rawData);

  let cleanMarkdown = removeDuplicates(markdown);

  const { imageMap, successCount, failCount } = await processImages(images, {
    noteName: resolvedNoteName,
    imageDir,
    outputDir: resolvedOutputDir,
    resourceDir: rawData.resourceDir || null,
  });

  const finalMarkdown = format(cleanMarkdown, {
    title,
    metadata,
    source: resolvedSource,
    tags,
    imageMap,
    imageDir,
  });

  ensureDir(resolvedOutputDir);
  const outputPath = path.join(resolvedOutputDir, `${resolvedNoteName}.md`);
  fs.writeFileSync(outputPath, finalMarkdown, 'utf8');

  return {
    outputPath,
    title,
    noteName: resolvedNoteName,
    imageCount: images.length,
    imageSuccessCount: successCount,
    imageFailCount: failCount,
    fileSize: (finalMarkdown.length / 1024).toFixed(2) + ' KB',
  };
}

module.exports = { run };
