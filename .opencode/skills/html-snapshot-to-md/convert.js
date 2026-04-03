const { run } = require('./src/index');

(async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node convert.js <html-file-or-url> [options]');
    console.log('\nOptions:');
    console.log('  --noteName <name>    笔记名称（用于文件名和图片命名前缀）');
    console.log('  --imageDir <dir>     图片子目录名（默认: 附录图）');
    console.log('  --outputDir <dir>    输出目录');
    console.log('  --tags <tag1,tag2>   标签（逗号分隔）');
    console.log('  --source <url>       来源 URL');
    console.log('\nExamples:');
    console.log('  node convert.js webpage.html');
    console.log('  node convert.js https://example.com');
    console.log('  node convert.js page.html --noteName "我的笔记" --imageDir "附录图"');
    process.exit(1);
  }

  const input = args[0];
  const options = { input };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--noteName' && args[i + 1]) {
      options.noteName = args[++i];
    } else if (args[i] === '--imageDir' && args[i + 1]) {
      options.imageDir = args[++i];
    } else if (args[i] === '--outputDir' && args[i + 1]) {
      options.outputDir = args[++i];
    } else if (args[i] === '--tags' && args[i + 1]) {
      options.tags = args[++i].split(',');
    } else if (args[i] === '--source' && args[i + 1]) {
      options.source = args[++i];
    }
  }

  try {
    const result = await run(options);
    console.log('\n=== Conversion Complete ===');
    console.log(`  Output: ${result.outputPath}`);
    console.log(`  Title:  ${result.title}`);
    console.log(`  Images: ${result.imageSuccessCount}/${result.imageCount} processed`);
    if (result.imageFailCount > 0) {
      console.log(`  Failed: ${result.imageFailCount} images`);
    }
    console.log(`  Size:   ${result.fileSize}\n`);
  } catch (error) {
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  }
})();
