import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllProjects, getProject } from "@/lib/content";
import { Action, Container, Eyebrow } from "@/components/ui";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { caseStudyComponents } from "@/components/case-study";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

function Headline({ text }: { text: string }) {
  // Mirror the design: a closing period is set in the accent colour.
  if (!text.endsWith(".")) return <>{text}</>;
  return (
    <>
      {text.slice(0, -1)}
      <span className="text-lime">.</span>
    </>
  );
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : undefined;
  const number = String(index + 1).padStart(2, "0");

  const { content } = await compileMDX({
    source: project.body,
    components: caseStudyComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });

  const primaryLink = project.links?.[0];

  return (
    <>
      <Container className="flex flex-col gap-9 pb-[72px] pt-10 md:pt-14">
        <p className="meta">
          <Link href="/projects" className="hover:text-lime">
            ← All work
          </Link>{" "}
          / Case study {number} / {project.year}
        </p>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-6">
            <Eyebrow>{project.eyebrow}</Eyebrow>
            <h1 className="font-display text-[clamp(2.5rem,1.2rem+3.6vw,4.75rem)] font-medium leading-[1.08] text-ink [text-wrap:balance]">
              <Headline text={project.headline} />
            </h1>
          </div>
          <div className="flex flex-col gap-6">
            <p className="max-w-[60ch] text-[clamp(1rem,0.95rem+0.3vw,1.125rem)] leading-[1.7] text-muted">{project.intro}</p>
            <div className="flex flex-wrap gap-4">
              {primaryLink ? (
                <Action href={primaryLink.href}>{primaryLink.label}</Action>
              ) : (
                <Action href="#contribution" arrow="↓">
                  Read my contribution
                </Action>
              )}
              <Action href="/#contact" variant="outline" arrow="→">
                Contact me
              </Action>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-line py-6 lg:grid-cols-4 lg:gap-16">
          {project.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-2">
              <dt className="meta">{fact.label}</dt>
              <dd className="text-sm text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <ArchitectureDiagram architecture={project.architecture} animate />

        {project.stats && (
          <ul className="grid gap-8 sm:grid-cols-3">
            {project.stats.map((stat) => (
              <li key={stat.label} className="flex flex-col gap-3 border-l border-line pl-6">
                <span className="font-display text-[52px] leading-none text-lime">{stat.value}</span>
                <span className="text-[15px] text-ink">{stat.label}</span>
                <span className="meta">{stat.note}</span>
              </li>
            ))}
          </ul>
        )}
      </Container>

      {content}

      {next && (
        <section className="border-t border-line">
          <Container className="flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 lg:max-w-[960px]">
              <Eyebrow tone="muted">Next project / {String(((index + 1) % projects.length) + 1).padStart(2, "0")}</Eyebrow>
              <p className="section-title">
                {next.title} — {next.tagline.charAt(0).toLowerCase() + next.tagline.slice(1)}
              </p>
            </div>
            <Action href={`/projects/${next.slug}`}>Explore {next.title}</Action>
          </Container>
        </section>
      )}
    </>
  );
}
