export interface BookMeta {
  id: number;
  name: string;
  type: number;
  printed: number;
  info: string;
  info_long: string;
  version: string;
  author_id: number;
  cat_id: number;
  date_built: number;
  author_page_start: number;
}

export interface BookIndexes {
  volumes: string[];
  headings: BookHeading[];
  print_pg_to_pg: Record<string, number>;
  volume_bounds: Record<string, [number, number]>;
  page_map: string[];
  page_headings: Record<string, number>;
  non_author: number[];
}

export interface BookHeading {
  title: string;
  level: number;
  page: number;
}

export interface BookApiResponse {
  meta: BookMeta;
  indexes: BookIndexes;
}

export interface PageMeta {
  headings: string[];
  page_id: number;
  page: number;
  vol: string;
  book_name: string;
  author_name: string;
}

export interface PageResult {
  meta: PageMeta;
  text: string;
}

export interface PageApiResponse {
  meta: string;
  text: string;
}

export interface AuthorInfo {
  id: number;
  name: string;
  biographic: string;
  death: string;
  era: string;
  link: string;
}

export interface AuthorApiResponse {
  info: AuthorInfo;
}

export interface SearchResultItem {
  id: number;
  name: string;
  author: string;
  author_id: number;
  about: string;
  match: string;
  cat_id: number;
  cat_name: string;
  page: number;
  meta: string;
}

export interface SearchResults {
  count: number;
  data: SearchResultItem[];
}

export interface SearchApiResponse {
  count: number;
  data: SearchResultItem[];
}
