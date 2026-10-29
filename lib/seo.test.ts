import { describe, expect, it } from "vitest";
import { blogPostingJsonLd, metaTitle, pageMetadata, personJsonLd, sitemapEntries } from "./seo";
import { site } from "@/content/site";
import type { Post, Project } from "./content";

const post = {
  slug: "guardrails-in-ai",
  title: "Guardrails in AI.",
  description: "Attacks and defences.",
  date: "2026-10-30T00:00:00.000Z",
  tags: ["Security", "LLM agents"],
} as Post;
const project = { slug: "contract-ai", title: "Contract AI" } as Project;

describe("metaTitle", () => {
  it("drops the stylistic closing period", () => {
    expect(metaTitle("Guardrails in AI.")).toBe("Guardrails in AI");
    expect(metaTitle("Contract AI")).toBe("Contract AI");
  });
});

describe("pageMetadata", () => {
  const meta = pageMetadata({ title: "Writing", description: "Notes.", path: "/writing" });

  it("points the canonical at the page itself", () => {
    expect(meta.alternates?.canonical).toBe("/writing");
  });

  it("repeats the site-wide Open Graph fields, which Next.js would otherwise drop", () => {
    expect(meta.openGraph).toMatchObject({ url: "/writing", siteName: site.name, type: "website", title: "Writing", description: "Notes." });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("keeps the site share image, which a page's own openGraph would otherwise drop", () => {
    expect(meta.openGraph?.images).toEqual([{ url: "/opengraph-image", width: 1200, height: 630, alt: site.title }]);
    expect(meta.twitter?.images).toEqual(["/opengraph-image"]);
  });

  it("marks articles with their publish date", () => {
    const article = pageMetadata({ title: "A", description: "B", path: "/writing/a", article: { publishedTime: post.date, tags: post.tags } });
    expect(article.openGraph).toMatchObject({ type: "article", publishedTime: post.date, tags: post.tags });
  });
});

describe("sitemapEntries", () => {
  const urls = sitemapEntries([project], [post]).map((entry) => entry.url);

  it("lists every public page with absolute URLs", () => {
    expect(urls).toEqual([
      site.url,
      `${site.url}/projects`,
      `${site.url}/writing`,
      `${site.url}/projects/contract-ai`,
      `${site.url}/writing/guardrails-in-ai`,
    ]);
  });

  it("leaves out the writing index when there are no posts", () => {
    expect(sitemapEntries([project], []).map((entry) => entry.url)).not.toContain(`${site.url}/writing`);
  });

  it("dates posts from their frontmatter, not the build time", () => {
    expect(sitemapEntries([], [post]).find((entry) => entry.url.endsWith(post.slug))?.lastModified).toBe(post.date);
  });
});

describe("structured data", () => {
  it("links the person only to public profiles", () => {
    const person = personJsonLd()["@graph"][0];
    expect(person.sameAs).toEqual(site.socials.map((social) => social.href));
    expect(JSON.stringify(personJsonLd())).not.toMatch(/email|telephone|@gmail/i);
  });

  it("describes an article with its author and date", () => {
    expect(blogPostingJsonLd(post)).toMatchObject({
      "@type": "BlogPosting",
      headline: "Guardrails in AI",
      datePublished: post.date,
      mainEntityOfPage: `${site.url}/writing/guardrails-in-ai`,
      author: { "@id": `${site.url}/#person` },
    });
  });
});
