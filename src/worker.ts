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
  server.registerTool(
    "turath_research",
    {
      description:
        "Research a question using Turath.io only. Searches Turath.io, selects the most relevant results, retrieves their exact pages, and returns the original Arabic text with book, author, volume, page, and source information. If Turath.io has no relevant results, explicitly reports that no information was found on Turath.io. Do not use general knowledge or external sources.",
      inputSchema: {
        query: z
          .string()
          .describe("The Arabic or English research question or topic"),
        max_results: z
          .number()
          .min(1)
          .max(5)
          .optional()
          .describe("Maximum number of Turath.io sources to retrieve"),
      },
    },
    async ({ query, max_results = 3 }) => {
      if (!query.trim()) {
        return {
          content: [
            {
              type: "text",
              text: "Error: research query is required.",
            },
          ],
          isError: true,
        };
      }

      try {
        // Step 1: Search Turath.io
        const searchResult = await api.searchBooks(query);

        const results = Array.isArray(searchResult?.data)
          ? searchResult.data
          : [];

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text",
                text:
                  "Turath.io میں اس سوال یا موضوع کے متعلق کوئی مناسب نتیجہ نہیں ملا۔ " +
                  "اس تحقیق کے لیے عمومی معلومات یا بیرونی ذرائع استعمال نہیں کیے گئے۔",
              },
            ],
          };
        }

        // Step 2: Parse search metadata
        const parsedResults = results
          .map((item: any) => {
            let meta: any = {};

            try {
              meta =
                typeof item.meta === "string"
                  ? JSON.parse(item.meta)
                  : item.meta || {};
            } catch {
              meta = {};
            }

            return {
              book_id: item.book_id,
              author_id: item.author_id,
              page_id: meta.page_id,
              page: meta.page,
              vol: meta.vol,
              book_name: meta.book_name,
              author_name: meta.author_name,
              headings: meta.headings || [],
              matched_text: item.text || item.snip || "",
            };
          })
          .filter(
            (item: any) =>
              item.book_id &&
              item.page &&
              item.book_name &&
              item.author_name
          );

        // Remove duplicate book/page combinations
        const uniqueResults: any[] = [];
        const seen = new Set<string>();

        for (const item of parsedResults) {
          const key = `${item.book_id}:${item.page}`;

          if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(item);
          }

          if (uniqueResults.length >= max_results) {
            break;
          }
        }

        // Step 3: Retrieve exact pages from Turath.io
        const sources: any[] = [];

        for (const item of uniqueResults) {
          try {
            const pageResult = await api.getPage(
              item.book_id,
              item.page
            );

            sources.push({
              book_id: item.book_id,
              author_id: item.author_id,
              book: item.book_name,
              author: item.author_name,
              volume: item.vol,
              page: item.page,
              page_id: item.page_id,
              headings: item.headings,
              search_match: item.matched_text,
              exact_page: pageResult,
              citation: `${item.book_name}، ${item.author_name}، ج ${item.vol}، ص ${item.page}`,
            });
          } catch (pageError) {
            sources.push({
              book_id: item.book_id,
              author_id: item.author_id,
              book: item.book_name,
              author: item.author_name,
              volume: item.vol,
              page: item.page,
              page_id: item.page_id,
              headings: item.headings,
              search_match: item.matched_text,
              page_error:
                pageError instanceof Error
                  ? pageError.message
                  : String(pageError),
              citation: `${item.book_name}، ${item.author_name}، ج ${item.vol}، ص ${item.page}`,
            });
          }
        }

        // Step 4: Return only Turath.io material
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  source: "Turath.io only",
                  query,
                  found: true,
                  total_search_results:
                    searchResult.count ?? results.length,
                  returned_sources: sources.length,
                  sources,
                  research_instruction:
                    "Use only the information contained in these Turath.io sources. Do not supplement the answer with general knowledge or external sources.",
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
              text: `Turath.io research error: ${
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
