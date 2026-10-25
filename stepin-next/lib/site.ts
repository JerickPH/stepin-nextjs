import fs from "node:fs";
import path from "node:path";
import site from "@/content/site.json";

export type PageMeta = { slug: string; title: string; bodyClass: string; footer: string };

const CONTENT = path.join(process.cwd(), "content");

export const pages = site.pages as Record<string, PageMeta>;
export const externalStylesheets = site.externalStylesheets as string[];

/** Look up a page by its URL slug ("" = home). */
export function getPage(slug: string): (PageMeta & { key: string }) | null {
  const key = slug === "" ? "home" : slug;
  const meta = pages[key];
  return meta ? { ...meta, key } : null;
}

/** Read a generated HTML fragment from /content (build time only). */
export function readFragment(...parts: string[]): string {
  const file = path.join(CONTENT, ...parts);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}
