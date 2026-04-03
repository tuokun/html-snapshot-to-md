# HTML Snapshot to Markdown

将网页（URL 远程抓取或浏览器另存为的本地 HTML）转换为 Obsidian 风格的 Markdown 笔记，自动处理图片的下载/移动/语义化命名。

[English](docs/README_en.md)

## 功能特点

- **双模式输入**：支持 URL 远程抓取和本地 HTML 文件两种输入源
- **智能内容提取**：使用 Mozilla Readability 算法提取网页正文
- **Obsidian 格式化**：自动生成 YAML frontmatter、wikilink 图片嵌入、标题层级偏移
- **图片语义命名**：根据图片上下文自动生成有意义的文件名（如 `哈希表-拉链法.png`）
- **远程图片下载**：自动下载 URL 模式下的远程图片到本地
- **去重处理**：自动识别并移除重复段落

## 快速开始

### 安装

本项目为 [OpenCode](https://opencode.ai) Skill，安装到你的 Obsidian vault：

```bash
# 1. 将 skill 目录复制到 vault 的 .opencode/skills/ 下
cp -r .opencode/skills/html-snapshot-to-md/ /path/to/vault/.opencode/skills/

# 2. 安装依赖
cd /path/to/vault/.opencode/skills/html-snapshot-to-md/
npm install
```

### 使用

安装后在 OpenCode 中直接对话即可触发 skill，例如：

- 「把这个网页转成笔记：https://programmercarl.com/...」
- 「把这个 HTML 文件转成 Obsidian 笔记，图片放到附录图文件夹」

## 处理流程

```
输入源 → 内容获取 → HTML转MD → 图片处理 → Obsidian格式化 → 输出
                                            │
                                    笔记名.md
                                    附录图/
                                    ├─ 笔记名-描述1.png
                                    └─ 笔记名-描述2.png
```

## 可配置选项

通过对话或 SKILL.md 中的编程接口指定：

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `noteName` | 笔记名称 | 网页标题 |
| `imageDir` | 图片子目录 | 附录图 |
| `outputDir` | 输出目录 | 当前目录 |
| `tags` | 标签数组 | - |
| `source` | 来源 URL | 自动检测 |

## 输出格式

```markdown
---
cssclasses: []
tags:
  - 算法
source: "https://example.com"
整理时间: "2026-04-03"
---

## 标题

正文内容...

![[附录图/笔记名-图片描述.png]]
```

## 图片语义命名

| 优先级 | 来源 | 示例 |
|--------|------|------|
| 1 | 有意义的 alt 文本 | `哈希表-哈希表结构图.png` |
| 2 | 最近标题 | `哈希表-拉链法.png` |
| 3 | 前文描述 | `哈希表-如图所示.png` |
| 4 | 兜底序号 | `哈希表-图1.png` |

## 项目结构

```
html-snapshot-to-md/
├── src/                        # 开发源码
│   ├── index.js              # 主入口
│   ├── fetcher.js            # 内容获取（URL + 本地）
│   ├── converter.js          # HTML → Markdown
│   ├── image-handler.js      # 图片处理
│   ├── obsidian-formatter.js # Obsidian 格式化
│   └── utils.js              # 工具函数
├── convert.js                  # CLI 入口
├── package.json
├── README.md
├── docs/README_en.md
├── LICENSE
└── .opencode/skills/html-snapshot-to-md/   # 自包含 Skill 目录（可直接复制分发）
    ├── SKILL.md                # Skill 文档
    ├── convert.js              # CLI 入口（副本）
    ├── package.json            # 依赖声明（副本）
    ├── src/                    # 源码（副本）
    │   ├── index.js
    │   ├── fetcher.js
    │   ├── converter.js
    │   ├── image-handler.js
    │   ├── obsidian-formatter.js
    │   └── utils.js
    └── examples/
```

### 安装为 Obsidian Skill

将 `.opencode/skills/html-snapshot-to-md/` 目录复制到目标 vault 的 `.opencode/skills/` 下，然后运行：

```bash
cd /path/to/vault/.opencode/skills/html-snapshot-to-md/
npm install
```

## 限制

1. URL 模式仅支持服务端渲染的静态页面
2. 复杂嵌套表格可能转换不完美
3. 假设 HTML 使用 UTF-8 编码
4. 图片下载失败时跳过（不中断流程）

## 许可证

MIT
