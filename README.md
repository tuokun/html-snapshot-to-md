# HTML Snapshot to Markdown

一个用于将浏览器"另存为"的 HTML 文件转换为 Markdown 文档的 Agent Skill。它使用 Mozilla Readability 算法提取纯净正文内容，自动处理图片，并生成格式规范的 Markdown 文件。

[English](docs/README_en.md)

## 功能特点

- **智能内容提取**：使用 Mozilla Readability 算法提取网页正文，自动过滤导航、广告等无关元素
- **图片自动整理**：自动将图片移动到 `images/` 文件夹并更新链接
- **元数据保留**：提取标题、作者、摘要等元数据
- **格式转换**：保留表格、列表、代码块等结构
- **中文支持**：完美处理中文内容和文件路径
- **去重处理**：自动识别并移除重复段落

## 适用场景

当你从浏览器保存网页时（右键"另存为"），会得到：
- 一个 `.html` 文件（HTML 结构）
- 一个同名资源文件夹（包含图片、CSS、JS 等资源）

此 skill 可以将这些文件重新组装成一个干净的 Markdown 文档。

## 使用方法

### 基本用法

#### 在 OpenCode CLI 中使用

```bash
opencode skills load html-snapshot-to-md
```

加载后，可以向 agent 提出请求：

> 将 `<网页名称>.html` 转换为 Markdown

agent 会自动：
1. 读取 HTML 文件
2. 查找同名资源文件夹
3. 提取纯净正文内容
4. 转换为 Markdown 格式
5. 处理图片（移动到 `images/` 文件夹）
6. 生成 `.md` 文件

### 处理流程

1. **读取 HTML**：使用 jsdom 创建 DOM 环境
2. **提取内容**：使用 Mozilla Readability 提取正文
3. **转换格式**：使用 Turndown 将 HTML 转换为 Markdown
4. **处理图片**：移动图片到 `images/` 文件夹并更新链接
5. **去重**：识别并移除重复内容
6. **生成文件**：输出 Markdown 文件

### 命令行使用

```bash
node convert.js <html文件>
```

示例：
```bash
# 转换单个 HTML 文件
node convert.js webpage.html

# 转换包含中文路径的文件
node convert.js "网页名称.html"
```

## 安装

### 前置要求

- Node.js v14 或更高版本
- npm（通常随 Node.js 一起安装）

### 安装依赖

```bash
npm install
```

## 文件结构

转换后会生成：

```
项目目录/
├── <网页名称>.html                     # 原始 HTML 文件
├── <网页名称>_files/                   # 原始资源文件夹
├── <网页名称>.md                      # 生成的 Markdown 文件
└── images/                            # 图片文件夹
    ├── <网页名称>_img_0.png
    ├── <网页名称>_img_1.png
    ├── <网页名称>_img_2.png
    └── <网页名称>_img_3.png
```

## Markdown 格式

生成的 Markdown 文件包含：

- 一级标题（提取自网页标题）
- 元数据区域（作者、摘要等）
- 正文内容（保留原始结构）
- 图片链接（自动更新为相对路径）

### 示例输出

```markdown
# 网页标题

**作者:** 作者名称

**摘要:** 文章摘要...

---

## 章节标题

这是文章的正文内容...

![](images/<网页名称>_img_1.png)

## 另一个章节标题

| 表头1 | 表头2 | 表头3 |
|--------|--------|--------|
| 内容1 | 内容2 | 内容3 |
```

## 技术栈

- **jsdom**：在 Node.js 中创建 DOM 环境
- **@mozilla/readability**：Firefox Reader View 的内容提取算法
- **turndown**：HTML 到 Markdown 的转换库

## 支持的功能

### HTML 元素转换

- ✅ 标题（`<h1>` 到 `<h6>`）
- ✅ 段落（`<p>`）
- ✅ 链接（`<a href="...">`）
- ✅ 图片（`<img src="...">`）
- ✅ 列表（有序、无序）
- ✅ 表格（标准表格）
- ✅ 代码块（保留语法高亮）
- ✅ 引用块（`<blockquote>`）
- ✅ 水平分隔线（`<hr>`）

### 代码块处理

保留代码块的语法高亮信息：
- HTML: `<code class="language-javascript">` → Markdown: ```javascript```
- 自动识别语言标记并转换

### 图片处理

- 自动检测资源文件夹中的图片
- 移动到 `images/` 文件夹
- 重命名为有序格式（如 `<网页名称>_img_0.png`）
- 更新 Markdown 中的图片链接
- 支持中文路径和特殊字符

## 已知限制

1. **静态 HTML**：仅支持浏览器"另存为"生成的静态 HTML，不执行 JavaScript
2. **标准表格**：复杂嵌套表格可能无法完美转换
3. **编码格式**：假设 HTML 使用 UTF-8 编码
4. **不支持的页面**：
   - SPA 应用（React、Vue、Angular）
   - 客户端渲染的内容
   - 实时数据获取
   - 交互元素（表单、按钮）

## 示例

### 输入文件

从浏览器保存的 HTML 文件：
```
<网页名称>.html
<网页名称>_files/
  ├── logo.png
  ├── image1.png
  ├── image2.png
  └── image3.png
```

### 输出文件

生成的 Markdown 文件：
```
<网页名称>.md
images/
  ├── <网页名称>_img_0.png
  ├── <网页名称>_img_1.png
  ├── <网页名称>_img_2.png
  └── <网页名称>_img_3.png
```

更多示例请查看 [examples/](.opencode/skills/html-snapshot-to-md/examples/) 文件夹。

## 项目结构

```
html-snapshot-to-md/
├── .gitignore                          # Git 忽略配置
├── LICENSE                            # MIT 许可证
├── package.json                        # 项目配置
├── convert.js                         # 核心转换脚本
├── .opencode/skills/html-snapshot-to-md/
│   ├── SKILL.md                        # Skill 文档
│   └── examples/                       # 示例文件夹
│       ├── README.md
│       └── example.md
└── README.md                          # 项目说明（本文件）
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 相关项目

- [markdown-image-organizer](https://github.com/tuokun/markdown-image-organizer)：在 Markdown 文档中组织和管理图片
