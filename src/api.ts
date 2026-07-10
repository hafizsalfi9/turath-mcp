import type {
  AuthorApiResponse,
  BookApiResponse,
  PageApiResponse,
  SearchApiResponse,
} from './types.js';

const API_BASE = 'https://api.turath.io/';
const FILES_BASE = 'https://files.turath.io/books/';
const API_VERSION = 3;

class TurathApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'TurathApiError';
    this.status = status;
  }
}

async function fetchJson<T>(url: URL): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new TurathApiError(
      `turath.io API returned ${res.status}: ${res.statusText}`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

function buildUrl(base: string, path: string, params?: Record<string, string | number | undefined>): URL {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalized, base);
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined) {
        url.searchParams.set(key, String(val));
      }
    }
  }
  return url;
}

export async function getBookInfo(bookId: number): Promise<BookApiResponse> {
  const url = buildUrl(API_BASE, '/book', {
    id: bookId,
    include: 'indexes',
    ver: API_VERSION,
  });
  return fetchJson<BookApiResponse>(url);
}

export async function getPage(bookId: number, page: number): Promise<PageApiResponse> {
  const url = buildUrl(API_BASE, '/page', {
    book_id: bookId,
    pg: page,
    ver: API_VERSION,
  });
  return fetchJson<PageApiResponse>(url);
}

export async function searchBooks(
  query: string,
  options?: {
    category?: number;
    author?: number;
    book?: number;
    page?: number;
    sortField?: string;
    precision?: number;
  },
): Promise<SearchApiResponse> {
  const url = buildUrl(API_BASE, '/search', {
    q: query,
    ver: API_VERSION,
    cat_id: options?.category,
    author: options?.author,
    book: options?.book,
    pg: options?.page,
    sort: options?.sortField,
    precision: options?.precision,
  });
  return fetchJson<SearchApiResponse>(url);
}

export async function getAuthor(authorId: number): Promise<AuthorApiResponse> {
  const url = buildUrl(API_BASE, '/author', {
    id: authorId,
    ver: API_VERSION,
  });
  return fetchJson<AuthorApiResponse>(url);
}

export async function getBookFile(bookId: number): Promise<Record<string, unknown>> {
  const url = new URL(`${bookId}.json`, FILES_BASE);
  return fetchJson<Record<string, unknown>>(url);
}
