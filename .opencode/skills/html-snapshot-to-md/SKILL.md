---
name: html-snapshot-to-md
description: Convert web pages (URL or local HTML) to Obsidian-flavored Markdown notes with semantic image management
version: "2.0.0"
---

# HTML Snapshot to Markdown Skill

将网页（URL 远程抓取或浏览器另存为的本地 HTML）转换为 Obsidian 风格的 Markdown 笔记，自动处理图片的下载/移动/语义化命名。

## 概述

支持两种输入源：

| 模式 | 输入 | 说明 |
|------|------|------|
| URL | `https://example.com` | 抓取远程网页，下载远程图片到本地 |
| 本地 | `page.html` | 读取浏览器另存为的 HTML，整理本地图片 |

输出为 Obsidian 风格 Markdown：
- YAML frontmatter（tags, source, 整理时间等）
- 图片使用 `![[附录图/xxx.png]]` Obsidian embed
- 图片语义化命名：`{笔记名}-{描述}.{ext}`
- 标题层级偏移（默认从 `##` 开始）

## 前置要求

- Node.js v14+
- npm 依赖：`@mozilla/readability`, `jsdom`, `turndown`

```bash
npm install
```

## 使用场景

- 从 URL 创建 Obsidian 笔记
- 将浏览器保存的 HTML 转为 Markdown
- 批量整理网页内容到 Obsidian vault
- 下载远程图片并语义化重命名

## 处理流程

```
输入源 → fetcher → converter → image-handler → obsidian-formatter → 输出
  │          │          │             │                  │
  │      获取HTML   提取+转MD    下载/重命名/移动     frontmatter+wikilinks
  │          │          │             │                  │
  ├─ URL ─→ fetch(url)  │             │                  │
  └─ 本地 ─→ readFile   │             │                  │
                     {title,md,    {imageMap,           最终输出:
                      images,      counts}              笔记名.md
                      metadata}                         附录图/
                                                        ├─ 笔记名-描述1.png
                                                        └─ 笔记名-描述2.png
```

### Step 1: 获取内容 (fetcher.js)

**URL 模式：**
```javascript
const { fetchFromUrl } = require('./src/fetcher');
const rawData = await fetchFromUrl('https://example.com');
// → { html, url, title, mode: 'url' }
```

**本地模式：**
```javascript
const { fetchFromLocal } = require('./src/fetcher');
const rawData = fetchFromLocal('page.html');
// → { html, path, title, resourceDir, htmlDir, htmlFile, mode: 'local' }
```

### Step 2: 提取并转换 (converter.js)

使用 Readability 提取正文，Turndown 转为 Markdown，同时收集图片信息：

```javascript
const { convert } = require('./src/converter');
const { title, markdown, images, metadata } = convert(rawData);
// images: [{ src, alt, context, isRemote, index }, ...]
```

图片上下文提取优先级：
1. 有意义的 alt 文本
2. 图片最近的标题文本
3. 图片前面的描述文字
4. 兜底序号（`图1`, `图2`）

### Step 3: 处理图片 (image-handler.js)

```javascript
const { processImages } = require('./src/image-handler');
const { imageMap, successCount, failCount } = await processImages(images, {
  noteName: '哈希表',
  imageDir: '附录图',
  outputDir: '/path/to/output',
  resourceDir: null,  // 本地模式传入资源文件夹路径
});
```

- 远程图片：通过 HTTP(S) 下载
- 本地图片：从 `_files/` 资源文件夹复制
- 语义化命名：`哈希表-拉链法.png`
- 自动验证：文件 < 100 bytes 视为下载失败
- 自动去重：同名追加序号

### Step 4: Obsidian 格式化 (obsidian-formatter.js)

```javascript
const { format } = require('./src/obsidian-formatter');
const final = format(markdown, {
  metadata,
  source: 'https://example.com',
  tags: ['算法', '哈希表'],
  imageMap,
  imageDir: '附录图',
  headingOffset: 1,
});
```

格式化内容：
- **YAML frontmatter**：`cssclasses`, `tags`, `source`, `整理时间`, `author`
- **图片链接**：`![alt](url)` → `![[附录图/笔记名-描述.png]]`
- **标题偏移**：`#` → `##`，`##` → `###`（Obsidian 用文件名作一级标题）
- **去重**：移除重复段落

### Step 5: 编排执行 (index.js)

```javascript
const { run } = require('./src/index');
const result = await run({
  input: 'https://example.com',  // 或本地路径
  noteName: '我的笔记',
  imageDir: '附录图',
  outputDir: '/path/to/output',
  tags: ['tag1', 'tag2'],
  headingOffset: 1,
});
// → { outputPath, title, noteName, imageCount, imageSuccessCount, imageFailCount, fileSize }
```

## CLI 使用

```bash
node convert.js <html文件或URL> [选项]
```

选项：
- `--noteName <name>` 笔记名称
- `--imageDir <dir>` 图片子目录（默认：附录图）
- `--outputDir <dir>` 输出目录
- `--tags <tag1,tag2>` 标签
- `--source <url>` 来源 URL

示例：
```bash
node convert.js https://example.com --noteName "测试笔记" --tags "测试,示例"
node convert.js page.html --noteName "我的笔记" --imageDir "附录图"
```

## 编程接口

```javascript
const { run } = require('./src/index');

// URL 模式
await run({
  input: 'https://programmercarl.com/...',
  noteName: '哈希表',
  outputDir: '/vault/蓝图/算法',
  imageDir: '附录图',
  tags: ['算法', '哈希表'],
});

// 本地模式
await run({
  input: './saved-page.html',
  noteName: 'NoSQL笔记',
  outputDir: './output',
  imageDir: '附录图',
});
```

## 模块化结构

```
src/
├── index.js              # 主入口编排
├── fetcher.js            # 内容获取（URL + 本地）
├── converter.js          # HTML → Markdown（Readability + Turndown）
├── image-handler.js      # 图片处理（下载 + 移动 + 语义命名）
├── obsidian-formatter.js # Obsidian 格式化（frontmatter + wikilinks）
└── utils.js              # 工具函数（命名、去重、文件操作）
```

## 图片语义命名规则

格式：`{笔记名}-{上下文描述}.{ext}`

| 优先级 | 来源 | 示例 |
|--------|------|------|
| 1 | 有意义的 alt 文本 | `哈希表-哈希表结构图.png` |
| 2 | 最近标题 | `哈希表-拉链法.png` |
| 3 | 前文描述 | `哈希表-如图所示.png` |
| 4 | 兜底序号 | `哈希表-图1.png` |

去重策略：同名时追加序号（`哈希表-过程1.png`, `哈希表-过程2.png`）

## 输出示例

```markdown
---
cssclasses: []
tags:
  - 算法
  - 哈希表
source: "https://programmercarl.com/..."
整理时间: "2026-04-03"
---

## 哈希表理论基础

哈希表是根据关键码直接进行访问的数据结构。

![[附录图/哈希表-哈希表结构.png]]

### 哈希函数

通过 hashCode 把名字转化为数值。

![[附录图/哈希表-哈希函数.png]]
```

## 限制

- URL 模式仅支持服务端渲染的静态页面（不支持 SPA）
- 复杂嵌套表格可能转换不完美
- 假设 HTML 使用 UTF-8 编码
- 图片下载失败时跳过（不中断整体流程）

## 相关 Skill

- **obsidian-markdown**: Obsidian Markdown 语法参考
- **markdown-image-organizer**: 现有 Markdown 文件的图片整理

## 参考

- [Mozilla Readability](https://github.com/mozilla/readability)
- [Turndown](https://github.com/mixmark-io/turndown)
- [jsdom](https://github.com/jsdom/jsdom)
