"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

export function TableOfContents({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="In this article" className="flex flex-col gap-5">
      <p className="meta text-lime">In this article</p>
      <ol className="flex flex-col gap-4 font-mono text-xs">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={clsx("transition-colors hover:text-ink", active === item.id ? "text-ink" : "text-muted")}
            >
              {String(i + 1).padStart(2, "0")}&nbsp;&nbsp;{item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
