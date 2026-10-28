"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { nav, site } from "@/content/site";
import { Container } from "@/components/ui";
import { InterviewTrigger } from "@/components/interview/interview-trigger";

export function SiteHeader({ hasWriting }: { hasWriting: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = nav.filter((item) => !("writing" in item) || hasWriting);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = items.map((item) => {
    const active = item.match?.test(pathname) ?? false;
    return (
      <Link
        key={item.label}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={clsx(
          "flex items-center gap-2.5 transition-colors",
          active ? "text-lime" : "text-muted hover:text-ink",
        )}
      >
        {active && <span aria-hidden className="size-1.5 rounded-full bg-lime" />}
        {item.label}
      </Link>
    );
  });

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/90 backdrop-blur-md">
      <Container className="flex h-[72px] items-center justify-between md:h-[104px]">
        <Link href="/" className="flex items-center gap-3.5 whitespace-nowrap" aria-label={`${site.name}, home`}>
          <span className="font-mono text-[26px] text-lime">{site.monogram}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 text-sm md:flex">
          {links}
          <InterviewTrigger className="text-muted transition-colors hover:text-ink">Interview</InterviewTrigger>
          <Link href="/#contact" className="text-ink transition-colors hover:text-lime">
            Contact
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
            {links}
            <InterviewTrigger className="text-left text-muted" onOpen={() => setOpen(false)}>
              Interview
            </InterviewTrigger>
            <Link href="/#contact" className="text-ink" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
