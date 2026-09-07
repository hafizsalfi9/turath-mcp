import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import * as api from "./api.js";

function createServer() {
  const server = new McpServer({
    name: "turath-mcp",
    version: "1.1.0",
  });

  // ------------------------------------------------------------
  // Tool 1: Search Turath.io
  // ------------------------------------------------------------
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
          .describe("Optional Turath.io category ID"),
        author: z
          .number()
          .optional()
          .describe("Optional Turath.io author ID"),
        book: z
          .number()
          .optional()
          .describe("Optional Turath.io book ID"),
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

  // ------------------------------------------------------------
  // Tool 2: Get Book Information
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Tool 3: Get Exact Page
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Tool 4: Get Author
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Tool 5: Get Complete Book File
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Tool 6: Turath Research
  // ------------------------------------------------------------
  server.registerTool(
    "turath_research",
    {
      description:
        "Conduct focused scholarly research using only Turath.io. Search Turath.io for the requested topic, select relevant results, retrieve the exact printed pages, and return the original Arabic text with book, author, volume, and page information. Use this tool for scholarly research concerning classical Arabic and Islamic texts. Do not supplement missing information with general knowledge or external sources.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Arabic or English research question, keyword, phrase, hadith wording, topic, or scholarly issue to search in Turath.io"
          ),

        category: z
          .number()
          .optional()
          .describe("Optional Turath.io category ID"),

        author: z
          .number()
          .optional()
          .describe("Optional Turath.io author ID"),

        book: z
          .number()
          .optional()
          .describe("Optional Turath.io book ID"),

        max_results: z
          .number()
          .min(1)
          .max(5)
          .optional()
          .describe(
            "Maximum number of relevant source pages to retrieve. Default is 3. Maximum is 5."
          ),
      },
    },

    async ({
      query,
      category,
      author,
      book,
      max_results,
    }) => {
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
        // --------------------------------------------------------
        // Step 1: Search Turath.io
        // --------------------------------------------------------

        const limit = max_results ?? 3;

        const searchResult = await api.searchBooks(query, {
          category,
          author,
          book,
        });

        // --------------------------------------------------------
        // Step 2: No results
        // --------------------------------------------------------

        if (
          !searchResult.data ||
          searchResult.data.length === 0
        ) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    source: "Turath.io",
                    query,
                    found: false,
                    total_search_results: 0,
                    returned_sources: 0,
                    sources: [],
                    message:
                      "No relevant results were found in Turath.io for this query.",
                    research_rule:
                      "Do not answer from general knowledge or external sources when Turath.io has no relevant evidence.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // --------------------------------------------------------
        // Step 3: Select valid search results
        // --------------------------------------------------------

        const selected = searchResult.data
          .filter(
            (item) =>
              Number.isFinite(item.id) &&
              Number.isFinite(item.page)
          )
          .slice(0, limit);

        // --------------------------------------------------------
        // Step 4: Retrieve exact pages
        // --------------------------------------------------------

        const sources = [];

        for (const result of selected) {
          try {
            const page = await api.getPage(
              result.id,
              result.page
            );

            sources.push({
              book_id: result.id,

              book: result.name,

              author: result.author,

              author_id: result.author_id,

              category: result.cat_name,

              volume: page.meta,

              page: result.page,

              matched_text: result.match,

              source_text: page.text,

              citation:
                `${result.name}، ${result.author}، ` +
                `صفحہ ${result.page}`,

              source: "Turath.io",
            });
          } catch (pageError) {
            sources.push({
              book_id: result.id,

              book: result.name,

              author: result.author,

              author_id: result.author_id,

              category: result.cat_name,

              page: result.page,

              matched_text: result.match,

              citation:
                `${result.name}، ${result.author}، ` +
                `صفحہ ${result.page}`,

              source: "Turath.io",

              page_error:
                pageError instanceof Error
                  ? pageError.message
                  : String(pageError),
            });
          }
        }

        // --------------------------------------------------------
        // Step 5: Return structured research package
        // --------------------------------------------------------

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  source: "Turath.io",

                  query,

                  found: true,

                  total_search_results:
                    searchResult.count,

                  returned_sources:
                    sources.length,

                  sources,

                  research_rule:
                    "Use only the information contained in the Turath.io search results and retrieved page texts. The original Arabic source_text is the primary evidence. Cite the book, author, volume, and page whenever available. If the evidence is insufficient, explicitly state that Turath.io did not provide sufficient evidence. Do not fill gaps using general knowledge, memory, or external websites.",
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text:
                `Turath.io research error: ${
                  error instanceof Error
                    ? error.message
                    : String(error)
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

// ------------------------------------------------------------
// Cloudflare Worker
// ------------------------------------------------------------

export default {
  fetch(request, env, ctx) {
    return createMcpHandler(createServer)(
      request,
      env,
      ctx
    );
  },
} satisfies ExportedHandler;        };
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
    },
  );

  server.registerTool(
    "turath_get_book_info",
    {
      description:
        "Get book metadata, author information, chapter index, and page mapping from Turath.io.",
      inputSchema: {
        book_id: z.number().describe("Turath.io book ID"),
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
    },
  );

  server.registerTool(
    "turath_get_page",
    {
      description:
        "Get the exact text of a specific printed page from a Turath.io book.",
      inputSchema: {
        book_id: z.number().describe("Turath.io book ID"),
        page: z.number().describe("Printed page number"),
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
    },
  );

  server.registerTool(
    "turath_get_author",
    {
      description:
        "Get author biography and metadata directly from Turath.io.",
      inputSchema: {
        author_id: z.number().describe("Turath.io author ID"),
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
    },
  );

  server.registerTool(
    "turath_get_book_file",
    {
      description:
        "Get the complete JSON book data from Turath.io when a downloadable book file is available.",
      inputSchema: {
        book_id: z.number().describe("Turath.io book ID"),
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
    },
  );

  return server;
}

export default {
  fetch(request, env, ctx) {
    return createMcpHandler(createServer)(request, env, ctx);
  },
} satisfies ExportedHandler;
