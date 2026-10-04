import type { Dossier, Document } from "./index.mjs";
export function discoverDataset(
  slug: string,
  options?: { fetchImpl?: typeof fetch; signal?: AbortSignal },
): Promise<Record<string, unknown>>;
export function queryAllPages(
  resourceId: string,
  options?: {
    fetchImpl?: typeof fetch;
    signal?: AbortSignal;
    maxPages?: number;
    filters?: Record<string, string | number>;
  },
): Promise<{
  resourceId: string;
  rows: Record<string, unknown>[];
  totalRows?: number;
  hasNext: boolean;
  pages: { url: string; count: number }[];
}>;
export function importQueryProof(
  query: Record<string, unknown>,
  answer: Record<string, unknown>,
  options?: { at?: string },
): Dossier;
