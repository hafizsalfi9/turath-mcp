# turath-mcp

MCP server for [turath.io](https://app.turath.io) — access thousands of classical Arabic and Islamic books via the Model Context Protocol.

Built on the public turath.io API, maintained by [Nuqayah](https://nuqayah.com).

## Features

- **8,500+ books** — classical Islamic texts: tafsir, hadith, fiqh, usul, Arabic language, biography, history, and more
- **No API key required** — zero configuration, works out of the box
- **Full-text search** — search across the entire catalog by keyword, author, category, or century
- **Page-level reading** — retrieve any page from any book as plain text (with chapter headings)
- **Chapter navigation** — every book includes a complete index of chapters with page numbers
- **Author biographies** — comprehensive metadata including full name, death year, and biographical notes

## Tools

### `turath_get_book_info`

Get book metadata, chapter index, and page map.

| Parameter | Required | Description |
|---|---|---|
| `book_id` | ✅ | Turath.io book ID (e.g., `9953` for al-Risala al-Qushayriyya) |

**Example:**
```
turath_get_book_info({ book_id: 9953 })
```

### `turath_get_page`

Get the text content of a specific page.

| Parameter | Required | Description |
|---|---|---|
| `book_id` | ✅ | Turath.io book ID |
| `page` | ✅ | Printed page number to retrieve |

**Example:**
```
turath_get_page({ book_id: 9953, page: 20 })
```

### `turath_search`

Search books in the turath.io catalog by keyword.

| Parameter | Required | Description |
|---|---|---|
| `query` | ✅ | Search keyword(s) in Arabic or English |
| `category` | ❌ | Filter by category ID |
| `author` | ❌ | Filter by author ID |
| `book` | ❌ | Restrict search to a specific book ID |
| `page` | ❌ | Paginate results (page number) |

**Example:**
```
turath_search({ query: "الرسالة" })
```

### `turath_get_author`

Get author biography and metadata.

| Parameter | Required | Description |
|---|---|---|
| `author_id` | ✅ | Turath.io author ID (e.g., `125` for Abd al-Karim al-Qushayri) |

**Example:**
```
turath_get_author({ author_id: 125 })
```

### `turath_get_book_file`

Get full book JSON dump. Only available for books that have a JSON file on the CDN.

| Parameter | Required | Description |
|---|---|---|
| `book_id` | ✅ | Turath.io book ID |

## Requirements

- Node.js >= 22
- An MCP-compatible client (OpenCode, Claude Code, Copilot, etc.)

## Installation

### Option 1: Clone & run

```bash
git clone https://github.com/opin22/turath-mcp
cd turath-mcp
npm install
npm start
```

### Option 2: Use with OpenCode

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

### Option 3: Use with Claude Code / other MCP clients

Configure it in your MCP settings file:

```json
{
  "mcpServers": {
    "turath-mcp": {
      "command": "npx",
      "args": ["--yes", "tsx", "/path/to/turath-mcp/src/index.ts"]
    }
  }
}
```

## How to find book IDs

1. Go to [app.turath.io](https://app.turath.io)
2. Search for a book
3. Open a book and look at the URL: `https://app.turath.io/book/9953`
4. The number (`9953`) is the book ID

Alternatively, use `turath_search` to find books by name and get their IDs from the results.

## Ethics & Rate Limiting

This server wraps a public, free API. Please be respectful:

- Avoid hammering the API with concurrent requests
- Cache results when possible
- If you build something that generates significant traffic, consider self-hosting

## Data Source

All content is served from [turath.io](https://app.turath.io), a project by [Nuqayah](https://nuqayah.com). The books are digitized classical Islamic texts — the vast majority are public domain.

## License

MIT
