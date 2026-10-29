import Link from "next/link";
import type { Project } from "@/lib/content";
import { Action, Eyebrow } from "@/components/ui";

export function ProjectFeature({ project, index }: { project: Project; index: number }) {
  const href = `/projects/${project.slug}`;
  const number = String(index + 1).padStart(2, "0");

  return (
    <article className="border-t border-line pt-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <Eyebrow tone="muted">
            Project {number} / {project.org} / {project.year}
          </Eyebrow>
          <h3 className="font-display text-[clamp(2.5rem,1.9rem+2.2vw,4rem)] font-medium leading-[1.05] text-ink">
            <Link href={href} className="group">
              {project.title}
              <span aria-hidden className="inline-block pl-[0.25em] text-lime transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                ↗
              </span>
            </Link>
          </h3>
          <p className="font-display text-[clamp(1.25rem,1.1rem+0.5vw,1.625rem)] font-medium leading-[1.2] text-ink">{project.tagline}</p>
        </div>
        <div className="flex flex-col items-start gap-6 lg:pt-9">
          <p className="hidden max-w-[60ch] leading-[1.7] text-muted sm:block">{project.summary}</p>
          {project.stats && (
            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              {project.stats.slice(0, 2).map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-sm text-muted">{stat.label}</dt>
                  <dd className="font-display text-[32px] font-medium leading-none text-lime">{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <Action href={href} variant="outline" arrow="→">
            Read case study
          </Action>
        </div>
      </div>
    </article>
  );
}
