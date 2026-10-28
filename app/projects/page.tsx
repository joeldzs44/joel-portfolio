import Link from "next/link";
import type { Metadata } from "next";
import { getAllProjects } from "@/lib/content";
import { Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = { title: "Work" };

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <Container className="flex flex-col gap-14 pb-24 pt-12 md:pt-16">
      <div className="flex flex-col gap-6">
        <Eyebrow>All work / {String(projects.length).padStart(2, "0")} case studies</Eyebrow>
        <h1 className="font-display text-[clamp(3.25rem,1.6rem+6vw,6.25rem)] font-medium leading-[1.02]">
          Systems, <span className="block">end to end.</span>
        </h1>
      </div>

      <ol className="border-b border-line">
        {projects.map((project, index) => (
          <li key={project.slug} className="border-t border-line">
            <Link
              href={`/projects/${project.slug}`}
              className="group grid gap-4 py-8 md:grid-cols-[180px_1fr_auto] md:gap-12"
            >
              <span className="flex flex-col gap-1">
                <span className="meta text-lime">
                  Case study {String(index + 1).padStart(2, "0")}
                </span>
                <span className="meta">
                  {project.org} / {project.year}
                </span>
              </span>
              <span className="flex flex-col gap-3">
                <span className="font-display text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-medium leading-[1.15] text-ink transition-colors group-hover:text-lime">
                  {project.title} — {project.tagline}
                </span>
                <span className="max-w-[72ch] leading-[1.7] text-muted">{project.summary}</span>
                <span className="meta">{project.stack.join(" · ")}</span>
              </span>
              <span aria-hidden className="hidden text-xl text-lime transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:block">
                ↗
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Container>
  );
}
