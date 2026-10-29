import type { Metadata, MetadataRoute } from "next";
import { site } from "@/content/site";
import type { Post, Project } from "./content";

// Search and link-preview metadata. Next.js replaces (not merges) a parent's openGraph
// when a page sets its own, so every page builds the full object here.

// Headings end in a stylistic period; titles in search results and tabs shouldn't.
export const metaTitle = (title: string) => title.replace(/\.$/, "");

type PageMeta = {
  title: string;
  description: string;
  path: string;
  article?: { publishedTime: string; tags: string[] };
};

// Served by app/opengraph-image.tsx.
const shareImage = "/opengraph-image";

export function pageMetadata({ title, description, path, article }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      siteName: site.name,
      locale: "en_IN",
      title,
      description,
      images: [{ url: shareImage, width: 1200, height: 630, alt: site.title }],
      ...(article ? { type: "article", authors: [site.url], ...article } : { type: "website" }),
    },
    twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  };
}

export function sitemapEntries(projects: Project[], posts: Post[]): MetadataRoute.Sitemap {
  return [
    { url: site.url },
    { url: `${site.url}/projects` },
    ...(posts.length > 0 ? [{ url: `${site.url}/writing`, lastModified: posts[0].date }] : []),
    ...projects.map((project) => ({ url: `${site.url}/projects/${project.slug}` })),
    ...posts.map((post) => ({ url: `${site.url}/writing/${post.slug}`, lastModified: post.date })),
  ];
}

const personId = `${site.url}/#person`;

// Public profiles only: no email or phone number, ever.
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: site.name,
        url: site.url,
        jobTitle: site.role,
        description: site.description,
        address: { "@type": "PostalAddress", addressLocality: site.location, addressCountry: "IN" },
        sameAs: site.socials.map((social) => social.href),
        knowsAbout: ["Large language models", "Retrieval-augmented generation", "AI agents", "Voice AI"],
      },
      { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, publisher: { "@id": personId } },
    ],
  };
}

export function blogPostingJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: metaTitle(post.title),
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", "@id": personId, name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}/writing/${post.slug}`,
    image: `${site.url}${shareImage}`,
    keywords: post.tags.join(", "),
  };
}
