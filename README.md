# turath-mcp

MCP server for [turath.io](https://app.turath.io) — access thousands of classical Arabic and Islamic books via the Model Context Protocol.

## Tools

| Tool | Description |
|---|---|
| `turath_get_book_info` | Get book metadata, chapter index, and page map |
| `turath_get_page` | Get the text content of a specific page from a book |
| `turath_search` | Search books in the turath.io catalog |
| `turath_get_author` | Get author biography and metadata |
| `turath_get_book_file` | Get full book JSON dump (when available) |

## Usage with OpenCode

Add to your `opencode.json`:

```json
{
  "mcp": {
    "turath-mcp": {
      "type": "local",
      "command": ["npx", "--yes", "tsx", "/path/to/turath-mcp/src/index.ts"]
    }
  }
}
```

Or install globally and run directly:

```bash
npm install -g turath-mcp
```

## Development

```bash
git clone https://github.com/opin22/turath-mcp
cd turath-mcp
npm install
npm start
```

## API

This server wraps the public [turath.io API](https://api.turath.io/). No API key required.

## License

MIT
