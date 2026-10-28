import { Children, isValidElement } from "react";
import { Container, Eyebrow, SectionIntro } from "@/components/ui";

// MDX building blocks for content/projects/*.mdx. See agentic-voice.mdx for usage.

type SectionProps = { label: string; title: string; children: React.ReactNode };

function Problem({ label, title, children }: SectionProps) {
  return (
    <section id="contribution" className="scroll-mt-28 bg-surface">
      <Container className="flex flex-col gap-10 py-20 md:py-[88px] lg:flex-row lg:gap-[100px]">
        <div className="flex flex-col gap-6 lg:w-[340px] lg:shrink-0">
          <Eyebrow>{label}</Eyebrow>
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="flex max-w-[72ch] flex-1 flex-col gap-6 leading-[1.7] text-muted [&>p:first-child]:text-[clamp(1.125rem,1rem+0.5vw,1.375rem)] [&>p:first-child]:text-ink">
          {children}
        </div>
      </Container>
    </section>
  );
}

function Stage({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-5 border border-line bg-surface p-6">
      <Eyebrow>{step}</Eyebrow>
      <h3 className="font-display text-2xl font-medium leading-[1.08]">{title}</h3>
      <div className="text-sm leading-[1.7] text-muted">{children}</div>
    </li>
  );
}

function Decision({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-display text-[28px] font-medium leading-[1.08]">{title}</h3>
      <div className="leading-[1.7] text-muted">{children}</div>
    </div>
  );
}

function Approach({ label, title, intro, children }: SectionProps & { intro?: string }) {
  const items = Children.toArray(children).filter(isValidElement);
  const stages = items.filter((child) => child.type === Stage);
  const decisions = items.filter((child) => child.type === Decision);

  return (
    <section>
      <Container className="flex flex-col gap-10 py-20 md:py-[88px]">
        <SectionIntro label={label} title={title} aside={intro} />
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stages}</ol>
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">{decisions}</div>
      </Container>
    </section>
  );
}

function Reflection({ label, title, subtitle, children }: SectionProps & { subtitle?: string }) {
  return (
    <section className="bg-surface">
      <Container className="flex flex-col gap-9 py-20 md:py-[88px]">
        <SectionIntro label={label} title={title} />
        <div className="flex max-w-[72ch] flex-col gap-5 leading-[1.7] text-muted">
          {subtitle && <h3 className="font-display text-[28px] font-medium leading-[1.08] text-ink">{subtitle}</h3>}
          {children}
        </div>
      </Container>
    </section>
  );
}

function Takeaway({ label, title, children, tone = "lime" }: SectionProps & { tone?: "lime" | "muted" }) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Eyebrow tone={tone}>{label}</Eyebrow>
      <h3 className="font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] font-medium leading-[1.08] text-ink [text-wrap:balance]">
        {title}
      </h3>
      <div className="leading-[1.7] text-muted">{children}</div>
    </div>
  );
}

function Takeaways({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as React.ReactElement<{ tone?: string }>[];
  return (
    <section>
      <Container className="flex flex-col gap-14 py-20 md:flex-row md:gap-20 md:py-[88px]">
        {items.map((item, i) => (
          <Takeaway key={i} {...(item.props as SectionProps)} tone={i % 2 ? "muted" : "lime"} />
        ))}
      </Container>
    </section>
  );
}

export const caseStudyComponents = { Problem, Approach, Stage, Decision, Reflection, Takeaways, Takeaway };
