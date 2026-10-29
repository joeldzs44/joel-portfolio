import { home } from "@/content/site";
import { education, experience } from "@/content/experience";
import { certifications } from "@/content/certifications";
import { formatMonth, getAllProjects } from "@/lib/content";
import { Eyebrow, Container, Lines, SectionIntro } from "@/components/ui";
import { Hero } from "@/components/hero";
import { SkillsSection } from "@/components/skills-section";
import { ProjectFeature } from "@/components/project-feature";
import { ContactSection } from "@/components/contact-section";
import { ArtGallery } from "@/components/gallery/art-gallery";
import { getApprovedArt } from "@/lib/gallery/store";

// Approved art commits refresh every five minutes, and immediately after a moderation action.
export const revalidate = 300;

export default async function HomePage() {
  const [projects, art] = await Promise.all([
    getAllProjects().then((all) => all.filter((project) => project.featured)),
    getApprovedArt(),
  ]);

  return (
    <>
      <Hero />
      <section id="work" aria-labelledby="work-title" className="bg-surface">
        <Container className="flex flex-col gap-14 py-20 md:py-24">
          <SectionIntro label={`01 / ${home.work.label}`} title={<span id="work-title">{home.work.title}</span>} aside={home.work.intro} />
          {projects.map((project, index) => (
            <ProjectFeature key={project.slug} project={project} index={index} />
          ))}
        </Container>
      </section>

      <SkillsSection index="02" />

      <section id="experience" aria-labelledby="experience-title" className="bg-surface">
        <Container className="flex flex-col gap-14 py-20 md:py-[104px] lg:flex-row lg:gap-[100px]">
          <div className="flex flex-col gap-6 lg:sticky lg:top-36 lg:w-[340px] lg:shrink-0 lg:self-start">
            <Eyebrow>03 / {home.experience.label}</Eyebrow>
            <h2 id="experience-title" className="section-title">
              <Lines lines={home.experience.title} />
            </h2>
            <p className="leading-[1.7] text-muted">{home.experience.intro}</p>
          </div>

          <ol className="flex flex-1 flex-col gap-8">
            {experience.map((role) => (
              <li key={`${role.company}-${role.start}`} className="flex flex-col gap-3.5 border-t border-line pt-3.5">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <h3 className="font-display text-[28px] font-medium leading-[1.08]">{role.title}</h3>
                  <p className="meta whitespace-nowrap pt-1">
                    {formatMonth(role.start)} — {formatMonth(role.end)}
                  </p>
                </div>
                <p className="font-mono text-xs text-lime">
                  {role.company} · {role.location}
                </p>
                <p className="max-w-[72ch] leading-[1.7] text-muted">{role.summary}</p>
                <details className="group">
                  <summary className="meta w-fit cursor-pointer list-none text-ink transition-colors hover:text-lime [&::-webkit-details-marker]:hidden">
                    <span className="group-open:hidden">+ Show highlights ({role.highlights.length})</span>
                    <span className="hidden group-open:inline">− Hide highlights</span>
                  </summary>
                  <ul className="mt-4 flex max-w-[72ch] flex-col gap-3 text-[15px] leading-[1.65] text-muted">
                    {role.highlights.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="text-lime">
                          ↳
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
            <li className="flex flex-col gap-3.5 border-t border-line pt-3.5">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <h3 className="font-display text-[28px] font-medium leading-[1.08]">{education.degree}</h3>
                <p className="meta whitespace-nowrap pt-1">{education.year}</p>
              </div>
              <p className="font-mono text-xs text-lime">{education.school}</p>
            </li>
          </ol>
        </Container>
      </section>

      <section id="certifications" aria-labelledby="certifications-title">
        <Container className="flex flex-col gap-8 py-20 md:py-[104px]">
          <SectionIntro
            label={`04 / ${home.certifications.label}`}
            title={<span id="certifications-title">{home.certifications.title}</span>}
            aside={home.certifications.intro}
          />
          <ul>
            {certifications.map((cert) => {
              const row = (
                <>
                  <span aria-hidden className="self-start font-mono text-xl text-lime md:self-auto md:text-[28px]">
                    [✳]
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="font-display text-xl text-ink md:text-2xl">{cert.name}</span>
                    <span className="font-mono text-xs text-muted">
                      {cert.issuer}
                      <span className="text-lime md:hidden"> · {cert.date}</span>
                    </span>
                  </span>
                  <span className="meta hidden md:inline">{cert.area}</span>
                  <span className="meta hidden whitespace-nowrap text-lime md:inline">{cert.date}</span>
                </>
              );
              const classes = "flex items-center gap-5 border-t border-line py-6 md:gap-8";
              return (
                <li key={cert.name}>
                  {cert.href ? (
                    <a href={cert.href} target="_blank" rel="noreferrer" className={`${classes} hover:bg-surface`}>
                      {row}
                    </a>
                  ) : (
                    <div className={classes}>{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section id="art" aria-labelledby="art-title" className="bg-surface">
        <Container className="flex flex-col gap-10 py-20 md:py-24">
          <SectionIntro label={`05 / ${home.art.label}`} title={<span id="art-title">{home.art.title}</span>} aside={home.art.intro} />
          <ArtGallery art={art} empty={home.art.empty} />
        </Container>
      </section>

      <ContactSection index="06" />
    </>
  );
}
