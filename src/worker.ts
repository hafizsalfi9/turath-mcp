import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import * as api from "./api.js";

function createServer() {
  const server = new McpServer({
    name: "turath-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "turath_search",
    {
      description:
        "Search the Turath.io database of classical Arabic and Islamic books. Returns search results directly from Turath.io.",
      inputSchema: {
        query: z
          .string()
          .describe("Arabic or English keyword or phrase to search"),
        category: z
          .number()
          .optional()
          .describe("Turath.io category ID"),
        author: z
          .number()
          .optional()
          .describe("Turath.io author ID"),
        book: z
          .number()
          .optional()
          .describe("Turath.io book ID"),
        page: z
          .number()
          .optional()
          .describe("Search results page number"),
      },
    },
    async ({ query, category, author, book, page }) => {
      if (!query.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Error: query is required.",
            },
          ],
          isError: true,
        };
      }

      try {
        const result = await api.searchBooks(query, {
          category,
          author,
          book,
          page,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Turath.io search error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "turath_get_book_info",
    {
      description:
        "Get book metadata, author information, chapter index, and page mapping from Turath.io.",
      inputSchema: {
        book_id: z
          .number()
          .describe("Turath.io book ID"),
      },
    },
    async ({ book_id }) => {
      try {
        const result = await api.getBookInfo(book_id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Turath.io book information error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "turath_get_page",
    {
      description:
        "Get the exact text of a specific printed page from a Turath.io book.",
      inputSchema: {
        book_id: z
          .number()
          .describe("Turath.io book ID"),
        page: z
          .number()
          .describe("Printed page number"),
      },
    },
    async ({ book_id, page }) => {
      try {
        const result = await api.getPage(book_id, page);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Turath.io page error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "turath_get_author",
    {
      description:
        "Get author biography and metadata directly from Turath.io.",
      inputSchema: {
        author_id: z
          .number()
          .describe("Turath.io author ID"),
      },
    },
    async ({ author_id }) => {
      try {
        const result = await api.getAuthor(author_id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Turath.io author error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "turath_get_book_file",
    {
      description:
        "Get the complete JSON book data from Turath.io when a downloadable book file is available.",
      inputSchema: {
        book_id: z
          .number()
          .describe("Turath.io book ID"),
      },
    },
    async ({ book_id }) => {
      try {
        const result = await api.getBookFile(book_id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Turath.io book file error: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

export default {
  fetch(request, env, ctx) {
    return createMcpHandler(createServer)(request, env, ctx);
  },
} satisfies ExportedHandler;
