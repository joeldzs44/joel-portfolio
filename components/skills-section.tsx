import { clsx } from "clsx";
import { home } from "@/content/site";
import { isTop, orderedTools, skills, toolName } from "@/content/skills";
import { Container, SectionIntro } from "@/components/ui";

export function SkillsSection({ index }: { index: string }) {
  return (
    <section id="skills" aria-labelledby="skills-title">
      <Container className="flex flex-col gap-14 py-20 md:py-24">
        <SectionIntro
          label={`${index} / ${home.skills.label}`}
          title={<span id="skills-title">{home.skills.title}</span>}
          aside={home.skills.intro}
        />
        <div className="grid gap-5 md:grid-cols-2">
          {skills.map((discipline) => (
            <article key={discipline.title} className="flex flex-col gap-6 border border-line bg-raised p-6 md:p-8 md:last:odd:col-span-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[clamp(1.5rem,1.3rem+0.6vw,1.875rem)] font-medium leading-[1.1] text-ink">
                    {discipline.title}
                  </h3>
                  <span className="shrink-0 font-mono text-xs text-dim">{discipline.tools.length} tools</span>
                </div>
                <p className="leading-[1.6] text-muted">{discipline.tagline}</p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {orderedTools(discipline.tools).map((tool) => (
                  <li
                    key={toolName(tool)}
                    className={clsx(
                      "border px-3 py-1.5 font-mono text-[13px]",
                      isTop(tool) ? "border-lime bg-lime text-lime-ink" : "border-line text-ink",
                    )}
                  >
                    {toolName(tool)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
