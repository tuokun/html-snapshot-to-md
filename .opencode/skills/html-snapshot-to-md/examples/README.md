# 示例

此文件夹包含 HTML 文件转换为 Markdown 的示例。

## 示例：Obsidian Plugin 指南文档

此示例演示了将 Obsidian Plugin 指南文档从 HTML 转换为 Markdown 的过程。

**来源**：Obsidian Plugin 指南文档
**转换后**：example.md

### 转换结果

- **原始文件**：Plugin guidelines - Developer Documentation.html (163 KB)
- **转换后**：example.md (14 KB)
- **图片**：3 张图片已处理
- **功能特性**：
  - 使用 Mozilla Readability 提取纯净内容
  - 自动更新图片路径
  - 保留元数据（标题、作者、摘要）
  - 保留格式（表格、列表、代码块）

### 使用方法

```bash
node convert.js "Plugin guidelines - Developer Documentation.html"
```

这将生成：
- `example.md` - 转换后的 Markdown 文件
- `images/` - 包含处理后的图片的文件夹

## 添加新示例

添加新示例：

1. 从浏览器保存一个 HTML 文件（使用"另存为"功能）
2. 运行：`node convert.js <your-file.html>`
3. 将生成的 `.md` 文件移动到此示例文件夹
4. 重命名为 `example.md`
5. 在此记录转换结果

## 注意事项

- 所有示例均来自公开的文档
- 排除了个人数据和敏感信息
- 图片使用相对路径引用
