import { home, site } from "@/content/site";
import { topSkills } from "@/content/skills";
import { Action, ActionArrow, Container, actionClasses } from "@/components/ui";
import { InterviewTrigger } from "@/components/interview/interview-trigger";

export function Hero() {
  const { hero } = home;

  return (
    <section aria-labelledby="hero-name" className="border-b border-line">
      <Container className="flex flex-col gap-10 pb-16 pt-10 md:gap-12 md:pb-20 md:pt-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2.5 border border-lime/40 bg-moss px-3 py-1.5 text-lime">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-lime" />
              </span>
              {hero.status}
            </span>
            <span className="text-muted">{hero.location}</span>
          </div>

          <div className="flex flex-col gap-2">
            <h1
              id="hero-name"
              className="font-display text-[clamp(3.25rem,1.6rem+6vw,7.5rem)] font-medium leading-[0.95] tracking-[-0.02em] text-ink"
            >
              {site.name}
              <span className="text-lime">.</span>
            </h1>
            <p className="font-display text-[clamp(1.375rem,1.15rem+0.9vw,2rem)] text-muted">{site.role}</p>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-4">
              <p className="max-w-[30ch] font-display text-[clamp(1.375rem,1.15rem+0.9vw,2rem)] font-medium leading-[1.2] text-ink [text-wrap:balance]">
                {hero.tagline}
              </p>
              <p className="hidden max-w-[58ch] leading-[1.7] text-muted sm:block">{hero.intro}</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <Action href="#work" arrow="↓" className="col-span-2 sm:w-auto">
                  See selected work
                </Action>
                <InterviewTrigger id="hero-interview" className={actionClasses("outline", "sm:w-auto")}>
                  <span>Interview me</span>
                  <ActionArrow arrow="→" variant="outline" />
                </InterviewTrigger>
                <Action href="#contact" variant="outline" arrow="→" className="sm:w-auto">
                  Get in touch
                </Action>
              </div>
              <p className="hidden text-sm text-dim sm:block">
                {hero.hint}
                <span className="[@media(hover:none)]:hidden"> {hero.shortcut}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:pt-1">
            <div className="flex flex-col gap-3">
              <h2 className="text-sm text-muted">Top skills</h2>
              <ul className="flex flex-wrap gap-2">
                {topSkills().map((skill) => (
                  <li key={skill} className="border border-line bg-raised px-3 py-1.5 font-mono text-[13px] text-ink">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <dl className="grid grid-cols-3 gap-6 border-t border-line pt-6">
              {hero.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-2">
                  <dt className="text-sm leading-snug text-muted">{stat.label}</dt>
                  <dd className="font-display text-[clamp(2.25rem,1.9rem+1.2vw,3.25rem)] font-medium leading-none text-lime">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
