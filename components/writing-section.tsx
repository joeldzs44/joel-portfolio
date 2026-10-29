import Link from "next/link";
import { home } from "@/content/site";
import { formatDate, type Post } from "@/lib/content";
import { Action, Container, SectionIntro } from "@/components/ui";

// A short list of the latest posts, so the home page reaches the writing before the contact form.
export function WritingSection({ posts, index }: { posts: Post[]; index: string }) {
  const { writing } = home;

  return (
    <section id="writing" aria-labelledby="writing-title">
      <Container className="flex flex-col gap-10 py-16 md:py-20">
        <SectionIntro label={`${index} / ${writing.label}`} title={<span id="writing-title">{writing.title}</span>} aside={writing.intro} />
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/writing/${post.slug}`}
                className="group flex flex-col gap-2 border-t border-line py-5 md:flex-row md:items-baseline md:justify-between md:gap-8"
              >
                <span className="font-display text-xl text-ink transition-colors group-hover:text-lime md:text-2xl">{post.title}</span>
                <span className="meta shrink-0">
                  {post.category} / {formatDate(post.date)} / {post.readingMinutes} min read
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Action href="/writing" variant="outline" arrow="→" className="self-start">
          All writing
        </Action>
      </Container>
    </section>
  );
}
