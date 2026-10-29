import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import type { Architecture } from "./architecture";

// Projects live in content/projects/*.mdx and posts in content/writing/*.mdx.
// The file name is the URL slug. Frontmatter shapes are documented by the types below.

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Project = {
  slug: string;
  title: string;
  // Search-result title, when the on-page title only makes sense on this site.
  seoTitle?: string;
  order: number;
  featured: boolean;
  year: string;
  org: string;
  tagline: string;
  summary: string;
  stack: string[];
  eyebrow: string;
  headline: string;
  intro: string;
  facts: { label: string; value: string }[];
  stats?: { value: string; label: string; note: string }[];
  architecture: Architecture;
  links?: { label: string; href: string }[];
  body: string;
};

export type Post = {
  slug: string;
  title: string;
  description: string;
  standfirst: string;
  date: string;
  category: string;
  tags: string[];
  draft: boolean;
  related?: { label: string; href: string };
  cover?: { label: string; caption: string; metrics: { label: string; value: number }[] };
  number: number;
  readingMinutes: number;
  chapters: string[];
  body: string;
};

async function readCollection(dir: string) {
  const full = path.join(CONTENT_DIR, dir);
  const files = await fs.readdir(full).catch(() => [] as string[]);
  return Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(full, file), "utf8");
        const { data, content } = matter(raw);
        return { slug: file.replace(/\.mdx$/, ""), data, body: content };
      }),
  );
}

export const getAllProjects = cache(async (): Promise<Project[]> => {
  const entries = await readCollection("projects");
  return entries
    .map(({ slug, data, body }) => ({ slug, featured: false, ...data, body }) as Project)
    .sort((a, b) => a.order - b.order);
});

export async function getProject(slug: string) {
  return (await getAllProjects()).find((project) => project.slug === slug);
}

const showDrafts = process.env.NODE_ENV === "development";

export const getAllPosts = cache(async (): Promise<Post[]> => {
  const entries = await readCollection("writing");
  const posts = entries
    .map(({ slug, data, body }) => {
      const words = body.split(/\s+/).filter(Boolean).length;
      const chapters = [...body.matchAll(/<Chapter[^>]*\blabel="([^"]+)"/g)].map((match) => match[1]);
      return {
        slug,
        tags: [],
        draft: false,
        ...data,
        date: new Date(data.date).toISOString(),
        readingMinutes: Math.max(1, Math.round(words / 220)),
        chapters,
        body,
      } as unknown as Omit<Post, "number">;
    })
    .filter((post) => showDrafts || !post.draft)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Number posts in publication order, then list newest first.
  return posts.map((post, index) => ({ ...post, number: index + 1 })).reverse();
});

export async function getPost(slug: string) {
  return (await getAllPosts()).find((post) => post.slug === slug);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "21 OCT 2026"
export function formatDate(iso: string) {
  const date = new Date(iso);
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`.toUpperCase();
}

// "2026-06" → "Jun 2026"; null → "Present"
export function formatMonth(yyyyMm: string | null) {
  if (!yyyyMm) return "Present";
  const [year, month] = yyyyMm.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export const pad = (n: number) => String(n).padStart(3, "0");
