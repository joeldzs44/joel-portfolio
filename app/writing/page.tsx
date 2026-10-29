import type { Metadata } from "next";
import { formatDate, getAllPosts, pad, type Post } from "@/lib/content";
import { writingPage } from "@/content/site";
import { Action, Container, Eyebrow, Lines } from "@/components/ui";
import { WritingArchive } from "@/components/writing-archive";

export const metadata: Metadata = { title: "Writing", description: writingPage.intro };

function Cover({ post }: { post: Post }) {
  if (!post.cover) {
    return (
      <div className="flex h-full flex-col gap-6 bg-moss p-8 md:p-10">
        <div className="meta flex justify-between">
          <span className="text-lime">In this article</span>
          <span>{pad(post.number)}</span>
        </div>
        <ol className="flex flex-col gap-3 font-mono text-xs text-muted">
          {post.chapters.map((chapter, i) => (
            <li key={chapter}>
              {String(i + 1).padStart(2, "0")} {chapter}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-8 bg-moss p-8 md:p-10">
      <div className="meta flex justify-between">
        <span className="text-lime">{post.cover.label}</span>
        <span>Fig. 01</span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-8">
        {post.cover.metrics.map((metric, i) => (
          <div key={metric.label} className="flex flex-col gap-3.5">
            <div className={i === 0 ? "flex items-end justify-between text-lime" : "flex items-end justify-between text-ink"}>
              <span className={i === 0 ? "meta text-lime" : "meta"}>{metric.label}</span>
              <span className="font-display text-[clamp(2.25rem,1.8rem+1.4vw,3rem)] leading-none">{metric.value}%</span>
            </div>
            <div className="h-5 bg-surface">
              <div className={i === 0 ? "h-full bg-lime" : "h-full bg-dim"} style={{ width: `${metric.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="meta">{post.cover.caption}</p>
    </div>
  );
}

export default async function WritingPage() {
  const posts = await getAllPosts();
  // The newest post is featured on top and still listed below, so the archive and its counts are complete.
  const [featured] = posts;

  return (
    <>
      <Container className="flex flex-col gap-12 pb-12 pt-12 md:pt-16 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-10">
          <Eyebrow>{writingPage.label}</Eyebrow>
          <h1 className="font-display text-[clamp(3.25rem,1.4rem+6.5vw,6.5rem)] font-medium leading-[1.02]">
            <Lines lines={writingPage.title} />
          </h1>
        </div>
        <p className="max-w-[44ch] text-[clamp(1rem,0.95rem+0.3vw,1.125rem)] leading-[1.7] text-muted">{writingPage.intro}</p>
      </Container>

      {!featured ? (
        <Container className="pb-24">
          <div className="flex flex-col items-start gap-4 border border-line bg-surface p-10">
            <Eyebrow>Nothing published yet</Eyebrow>
            <p className="max-w-[60ch] leading-[1.7] text-muted">
              Notes will appear here as they’re published. Add an MDX file to content/writing to publish one.
            </p>
          </div>
        </Container>
      ) : (
        <>
          <Container className="pb-20">
            <article className="grid bg-surface lg:grid-cols-[630px_1fr]">
              <div className="flex flex-col items-start gap-7 p-8 md:p-10">
                <Eyebrow>
                  Latest / {featured.category} / {formatDate(featured.date)}
                </Eyebrow>
                <h2 className="section-title [text-wrap:balance]">{featured.title}</h2>
                <p className="leading-[1.7] text-muted">{featured.description}</p>
                <div className="flex w-full flex-wrap items-center justify-between gap-4">
                  <Action href={`/writing/${featured.slug}`}>Read the article</Action>
                  <span className="meta">
                    {featured.readingMinutes} min read / {pad(featured.number)}
                  </span>
                </div>
              </div>
              <Cover post={featured} />
            </article>
          </Container>

          {posts.length > 1 && (
            <Container className="pb-24">
              <WritingArchive
                entries={posts.map((post) => ({
                  slug: post.slug,
                  title: post.title,
                  description: post.description,
                  category: post.category,
                  number: pad(post.number),
                  date: post.date,
                  dateLabel: formatDate(post.date),
                  tags: post.tags,
                  readingMinutes: post.readingMinutes,
                  draft: post.draft,
                }))}
              />
            </Container>
          )}
        </>
      )}

      <section className="bg-moss">
        <Container className="flex flex-col gap-6 py-16 md:flex-row md:gap-0 md:py-20">
          <Eyebrow className="md:w-[260px] md:shrink-0">{writingPage.stance.label}</Eyebrow>
          <div className="flex max-w-[72ch] flex-col gap-6">
            <h2 className="font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] font-medium leading-[1.15]">
              {writingPage.stance.title}
            </h2>
            <p className="leading-[1.7] text-muted">{writingPage.stance.body}</p>
            <Eyebrow>{writingPage.stance.motto}</Eyebrow>
          </div>
        </Container>
      </section>
    </>
  );
}
