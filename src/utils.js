const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sanitizeFileName(name) {
  return name
    .replace(/[<>:"/\\|?*\n\r]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 100);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getFileExtension(filePath) {
  return path.extname(filePath).toLowerCase();
}

function removeDuplicates(markdown) {
  const paragraphs = markdown.split(/\n\n+/);
  const seen = new Set();
  const unique = [];

  for (const para of paragraphs) {
    const normalized = para.trim().replace(/\s+/g, ' ');
    if (normalized.length > 10) {
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

function generateImageName(noteName, description, ext, existingNames) {
  const baseName = `${noteName}-${sanitizeFileName(description)}${ext}`;
  if (!existingNames.has(baseName)) {
    existingNames.add(baseName);
    return baseName;
  }
  let counter = 1;
  let name;
  do {
    name = `${noteName}-${sanitizeFileName(description)}${counter}${ext}`;
    counter++;
  } while (existingNames.has(name));
  existingNames.add(name);
  return name;
}

module.exports = {
  sanitizeFileName,
  ensureDir,
  getFileExtension,
  removeDuplicates,
  generateImageName,
};
