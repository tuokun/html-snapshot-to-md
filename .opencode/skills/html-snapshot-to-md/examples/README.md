# Examples

This folder contains example conversions of HTML files to Markdown.

## Example: Plugin guidelines - Developer Documentation

This example demonstrates the conversion of the Obsidian Plugin Guidelines documentation from HTML to Markdown.

**Source:** Obsidian Plugin Guidelines Documentation
**Converted:** Plugin guidelines - Developer Documentation.md

### Conversion Results

- **Original:** Plugin guidelines - Developer Documentation.html (163 KB)
- **Converted:** Plugin guidelines - Developer Documentation.md (14 KB)
- **Images:** 3 images processed
- **Features:**
  - Clean content extraction using Mozilla Readability
  - Automatic image path updates
  - Metadata preservation (title, author, excerpt)
  - Format preservation (tables, lists, code blocks)

### How to Use

```bash
node convert.js "Plugin guidelines - Developer Documentation.html"
```

This will generate:
- `Plugin guidelines - Developer Documentation.md` - The converted Markdown file
- `images/` - Folder with processed images

## Adding New Examples

To add a new example:

1. Save an HTML file from a browser (using "Save As" feature)
2. Run: `node convert.js <your-file.html>`
3. Move the generated `.md` file to this examples folder
4. Document the conversion results here

## Notes

- All examples are derived from publicly available documentation
- Personal data and sensitive information are excluded
- Images are referenced with relative paths
