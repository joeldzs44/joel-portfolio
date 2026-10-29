import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { formatDate, getAllPosts, getPost, pad } from "@/lib/content";
import { site } from "@/content/site";
import { Action, Container, Eyebrow } from "@/components/ui";
import { articleComponents, slugify } from "@/components/article";
import { TableOfContents } from "@/components/table-of-contents";
import { JsonLd } from "@/components/json-ld";
import { blogPostingJsonLd, metaTitle, pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

// Content only changes on deploy, so unknown slugs get the static 404 without a render.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllPosts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return pageMetadata({
    title: metaTitle(post.title),
    description: post.description,
    path: `/writing/${post.slug}`,
    article: { publishedTime: post.date, tags: post.tags },
  });
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const posts = await getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const post = posts[index];
  // Posts are newest first, so the "next" read is the one published before this.
  const next = posts.length > 1 ? posts[(index + 1) % posts.length] : undefined;

  const { content } = await compileMDX({
    source: post.body,
    components: articleComponents(post.chapters),
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post)} />
      <Container className="flex flex-col gap-8 pb-16 pt-10 md:pt-14">
        <p className="meta">
          <Link href="/writing" className="hover:text-lime">
            ← All writing
          </Link>{" "}
          / {post.category} / {pad(post.number)}
        </p>
        <h1 className="font-display text-[clamp(2.75rem,1.2rem+5.5vw,6rem)] font-medium leading-[1.08] [text-wrap:balance]">
          {post.title}
        </h1>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-20">
          <p className="max-w-[60ch] flex-1 text-[clamp(1.125rem,1rem+0.6vw,1.5rem)] leading-[1.6] text-muted">
            {post.standfirst}
          </p>
          <div className="flex flex-col gap-3 lg:w-[340px] lg:shrink-0">
            <p className="font-display text-[22px] text-ink">{site.name}</p>
            <p className="meta">
              <time dateTime={post.date}>{formatDate(post.date)}</time> / {post.readingMinutes} min read
              {post.tags.length > 0 && (
                <>
                  <br />
                  {post.tags.join(" · ")}
                </>
              )}
            </p>
          </div>
        </div>
        <hr className="border-line" />
      </Container>

      <Container className="flex flex-col gap-12 pb-24 lg:flex-row lg:gap-[100px]">
        <aside className="hidden lg:block lg:w-[240px] lg:shrink-0">
          <div className="sticky top-36 flex flex-col gap-8">
            {post.chapters.length > 0 && (
              <TableOfContents items={post.chapters.map((label) => ({ id: slugify(label), label }))} />
            )}
            {post.related && (
              <Link href={post.related.href} className="meta border-t border-line pt-6 text-lime hover:text-ink">
                Related / {post.related.label} ↗
              </Link>
            )}
          </div>
        </aside>

        <article className="flex max-w-[760px] flex-1 flex-col gap-6 text-[17px] leading-[1.75] text-muted [&>p:first-child]:text-[clamp(1.125rem,1rem+0.4vw,1.3125rem)] [&>p:first-child]:text-ink [&_section>p]:text-muted [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-medium [&_strong]:text-ink">
          {content}
        </article>
      </Container>

      {next && (
        <section className="border-t border-line bg-surface">
          <Container className="flex flex-col gap-8 py-14 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4">
              <Eyebrow>
                Keep reading / {next.category} / {pad(next.number)}
              </Eyebrow>
              <p className="section-title [text-wrap:balance]">{next.title}</p>
            </div>
            <Action href={`/writing/${next.slug}`} variant="outline">
              Next article
            </Action>
          </Container>
        </section>
      )}
    </>
  );
}
