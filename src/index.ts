import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import * as api from './api.js';

const server = new Server(
  {
    name: "turath-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "turath_get_book_info",
      description: "Get book metadata, chapter index, and page map from turath.io",
      inputSchema: {
        type: "object",
        properties: {
          book_id: {
            type: "number",
            description: "Turath.io book ID (e.g., 9953 for al-Risala al-Qushayriyya)",
          },
        },
        required: ["book_id"],
      },
    },
    {
      name: "turath_get_page",
      description: "Get the text content of a specific page from a book",
      inputSchema: {
        type: "object",
        properties: {
          book_id: {
            type: "number",
            description: "Turath.io book ID",
          },
          page: {
            type: "number",
            description: "Page number to retrieve (corresponds to printed page)",
          },
        },
        required: ["book_id", "page"],
      },
    },
    {
      name: "turath_search",
      description: "Search books on turath.io catalog by keyword",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search keyword(s) in Arabic or English",
          },
          category: {
            type: "number",
            description: "Filter by category ID",
          },
          author: {
            type: "number",
            description: "Filter by author ID",
          },
          book: {
            type: "number",
            description: "Restrict search to a specific book ID",
          },
          page: {
            type: "number",
            description: "Page number of search results (pagination)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "turath_get_author",
      description: "Get author biography and metadata from turath.io",
      inputSchema: {
        type: "object",
        properties: {
          author_id: {
            type: "number",
            description: "Turath.io author ID (e.g., 125 for Abd al-Karim al-Qushayri)",
          },
        },
        required: ["author_id"],
      },
    },
    {
      name: "turath_get_book_file",
      description: "Get full book JSON dump (may not be available for all books)",
      inputSchema: {
        type: "object",
        properties: {
          book_id: {
            type: "number",
            description: "Turath.io book ID",
          },
        },
        required: ["book_id"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "turath_get_book_info": {
        const bookId = Number(args?.book_id);
        if (!bookId) throw new McpError(ErrorCode.InvalidParams, "book_id is required");
        const result = await api.getBookInfo(bookId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "turath_get_page": {
        const bookId = Number(args?.book_id);
        const page = Number(args?.page);
        if (!bookId || !page) {
          throw new McpError(ErrorCode.InvalidParams, "book_id and page are required");
        }
        const result = await api.getPage(bookId, page);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "turath_search": {
        const query = String(args?.query ?? "");
        if (!query) throw new McpError(ErrorCode.InvalidParams, "query is required");
        const result = await api.searchBooks(query, {
          category: args?.category ? Number(args.category) : undefined,
          author: args?.author ? Number(args.author) : undefined,
          book: args?.book ? Number(args.book) : undefined,
          page: args?.page ? Number(args.page) : undefined,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "turath_get_author": {
        const authorId = Number(args?.author_id);
        if (!authorId) throw new McpError(ErrorCode.InvalidParams, "author_id is required");
        const result = await api.getAuthor(authorId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "turath_get_book_file": {
        const bookId = Number(args?.book_id);
        if (!bookId) throw new McpError(ErrorCode.InvalidParams, "book_id is required");
        const result = await api.getBookFile(bookId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`,
        );
    }
  } catch (error) {
    if (error instanceof McpError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
