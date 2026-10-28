"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { contactNav, nav, site } from "@/content/site";
import { activeNavLabel } from "@/lib/nav";
import { Container } from "@/components/ui";

// The id of the home-page section under a line 35% down the viewport, or null above the first one.
// While paused (the mobile menu is open and pushes the page down) the last value is kept.
function useSectionInView(enabled: boolean, paused: boolean) {
  const [section, setSection] = useState<string | null>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    if (!enabled) return setSection(null);
    const sections = [...document.querySelectorAll<HTMLElement>("main section[id]")];
    let frame = 0;
    const update = () => {
      frame = 0;
      if (pausedRef.current) return;
      const line = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const element of sections) if (element.getBoundingClientRect().top <= line) current = element.id;
      // The last section may be too short to reach the line; at the bottom of the page it's the one in view.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.at(-1)?.id ?? current;
      setSection(current);
    };
    const schedule = () => (frame ||= requestAnimationFrame(update));
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);
  return section;
}

export function SiteHeader({ hasWriting }: { hasWriting: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = nav.filter((item) => !("writing" in item) || hasWriting);
  const active = activeNavLabel(pathname, useSectionInView(pathname === "/", open));

  // One dot slides between desktop items; its position is measured from the marked link.
  const desktopNav = useRef<HTMLElement>(null);
  const [dot, setDot] = useState<{ x: number; placed: boolean } | null>(null);
  useLayoutEffect(() => {
    const place = () => {
      const link = desktopNav.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
      setDot((previous) => (link ? { x: link.offsetLeft, placed: previous !== null } : null));
    };
    place();
    window.addEventListener("resize", place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener("resize", place);
  }, [active, hasWriting]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const routeMatch = (item: (typeof items)[number]) => item.match?.test(pathname) ?? false;
  const tone = (label: string, rest: string) => (active === label ? "text-lime" : rest);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/90 backdrop-blur-md">
      <Container className="flex h-[72px] items-center justify-between md:h-[104px]">
        <Link href="/" className="flex items-center gap-3.5 whitespace-nowrap" aria-label={`${site.name}, home`}>
          <span className="font-mono text-[26px] text-lime">{site.monogram}</span>
        </Link>

        <nav ref={desktopNav} aria-label="Main" className="relative hidden items-center gap-9 text-sm md:flex">
          <span
            aria-hidden
            className={clsx(
              "pointer-events-none absolute left-0 top-1/2 -mt-[3px] size-1.5 rounded-full bg-lime",
              dot?.placed && "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
              dot ? "opacity-100" : "opacity-0",
            )}
            style={{ transform: `translateX(${(dot?.x ?? 0) - 14}px)` }}
          />
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              data-nav={item.label}
              aria-current={routeMatch(item) ? "page" : undefined}
              className={clsx("transition-colors", tone(item.label, "text-muted hover:text-ink"))}
            >
              {item.label}
            </Link>
          ))}
          <Link href={contactNav.href} data-nav={contactNav.label} className={clsx("transition-colors", tone(contactNav.label, "text-ink hover:text-lime"))}>
            {contactNav.label}
          </Link>
        </nav>

        <button
          type="button"
          className="meta -mr-2 p-2 text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </Container>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line md:hidden">
          <Container className="flex flex-col gap-5 py-6 text-lg">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={routeMatch(item) ? "page" : undefined}
                className={clsx("flex items-center gap-2.5 transition-colors", tone(item.label, "text-muted hover:text-ink"))}
                onClick={() => setOpen(false)}
              >
                {active === item.label && <span aria-hidden className="size-1.5 rounded-full bg-lime" />}
                {item.label}
              </Link>
            ))}
            <Link href={contactNav.href} className={clsx("flex items-center gap-2.5", tone(contactNav.label, "text-ink"))} onClick={() => setOpen(false)}>
              {active === contactNav.label && <span aria-hidden className="size-1.5 rounded-full bg-lime" />}
              {contactNav.label}
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
