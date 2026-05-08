const fs = require('fs');
const path = require('path');
const { httpGet } = require('./fetcher');
const { sanitizeFileName, ensureDir, getFileExtension, generateImageName } = require('./utils');

async function processImages(images, options) {
  const {
    noteName,
    imageDir,
    outputDir,
    resourceDir = null,
  } = options;

  const targetDir = path.join(outputDir, imageDir);
  ensureDir(targetDir);

  const existingNames = new Set(
    fs.readdirSync(targetDir, { withFileTypes: true })
      .filter((f) => f.isFile())
      .map((f) => f.name)
  );

  const imageMap = {};
  let successCount = 0;
  let failCount = 0;

  for (const img of images) {
    const ext = getFileExtension(img.src) || '.png';
    const newName = generateImageName(noteName, img.context, ext, existingNames);
    const newPath = path.join(targetDir, newName);

    try {
      if (img.isRemote) {
        await downloadImage(img.src, newPath);
      } else if (resourceDir) {
        const localPath = path.join(resourceDir, path.basename(img.src));
        if (fs.existsSync(localPath)) {
          fs.copyFileSync(localPath, newPath);
        } else {
          failCount++;
          continue;
        }
      } else {
        failCount++;
        continue;
      }

      const size = fs.statSync(newPath).size;
      if (size < 100) {
        fs.unlinkSync(newPath);
        failCount++;
        continue;
      }

      imageMap[img.src] = `${imageDir}/${newName}`;
      if (!img.isRemote) {
        imageMap[path.basename(img.src)] = `${imageDir}/${newName}`;
      }
      successCount++;
    } catch (e) {
      console.warn(`  [WARN] Image failed: ${img.src} - ${e.message}`);
      failCount++;
    }
  }

  return {
    imageMap,
    successCount,
    failCount,
    targetDir,
  };
}

function downloadImage(url, destPath) {
  return httpGet(url).then((res) => {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
      stream.on('error', reject);
    });
  });
}

module.exports = { processImages, downloadImage };
