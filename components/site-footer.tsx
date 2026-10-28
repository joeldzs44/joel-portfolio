import { site } from "@/content/site";
import { Container } from "@/components/ui";

export function SiteFooter() {
  const links = [
    ...site.socials.map((social) => ({ ...social, external: true })),
    ...(site.resumeUrl ? [{ label: "Résumé", href: site.resumeUrl, external: true }] : []),
  ];

  return (
    <footer className="bg-surface">
      <Container className="flex flex-col gap-8 border-t border-line py-10 md:flex-row md:items-center md:justify-between">
        <p className="font-display text-[22px] text-ink">{site.name}</p>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-muted">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="transition-colors hover:text-lime"
                {...(link.external && { target: "_blank", rel: "noreferrer" })}
              >
                {link.label} ↗
              </a>
            </li>
          ))}
          <li>
            <a href="#main" className="transition-colors hover:text-lime">
              Back to top ↑
            </a>
          </li>
        </ul>
        <p className="meta">© {new Date().getFullYear()} / Built with intent</p>
      </Container>
    </footer>
  );
}
