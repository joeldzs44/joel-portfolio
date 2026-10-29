import { Children, isValidElement } from "react";
import { Eyebrow } from "@/components/ui";

// MDX building blocks for content/writing/*.mdx. See how-to-publish.mdx for usage.

// MDX joins one-reference-per-line into a single paragraph; split it back into one item per line.
function referenceItems(children: React.ReactNode): React.ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    const text = isValidElement<{ children?: React.ReactNode }>(child) ? child.props.children : child;
    return typeof text === "string" ? text.split("\n").map((line) => line.trim()).filter(Boolean) : [child];
  });
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function articleComponents(chapters: string[]) {
  function Chapter({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
    const index = chapters.indexOf(label) + 1;
    return (
      <section id={slugify(label)} className="flex scroll-mt-32 flex-col gap-5 pt-6">
        <Eyebrow>
          {String(index).padStart(2, "0")} / {label}
        </Eyebrow>
        <h2 className="font-display text-[clamp(1.625rem,1.3rem+1.1vw,2.125rem)] font-medium leading-[1.15] text-ink">
          {title}
        </h2>
        {children}
      </section>
    );
  }

  function PullQuote({ children, note }: { children: React.ReactNode; note?: string }) {
    return (
      <figure className="my-4 flex flex-col gap-3 border-l-2 border-lime bg-moss px-7 py-8">
        <blockquote className="font-display text-[clamp(1.375rem,1.1rem+1vw,1.75rem)] leading-[1.3] text-lime">
          “{children}”
        </blockquote>
        {note && <figcaption className="meta">{note}</figcaption>}
      </figure>
    );
  }

  function Summary({ children, title = "The short version" }: { children: React.ReactNode; title?: string }) {
    return (
      <aside className="my-4 flex flex-col gap-5 border border-line bg-surface p-7 md:p-9">
        <Eyebrow>{title}</Eyebrow>
        <div className="text-ink [&_li]:flex [&_li]:gap-3 [&_li]:before:text-lime [&_li]:before:content-['↳'] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-3">
          {children}
        </div>
      </aside>
    );
  }

  function References({ children }: { children: React.ReactNode }) {
    return (
      <footer className="mt-6 flex flex-col gap-4 border-t border-line pt-8">
        <Eyebrow tone="muted">Reading & context</Eyebrow>
        <ol className="flex flex-col gap-3 text-sm leading-[1.7] text-muted">
          {referenceItems(children).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </footer>
    );
  }

  return {
    Chapter,
    PullQuote,
    Summary,
    References,
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a {...props} className="text-lime underline decoration-lime/40 underline-offset-4 hover:decoration-lime" />
    ),
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <pre {...props} className="my-2 overflow-x-auto border border-line bg-surface p-6 font-mono text-[13px] leading-[1.8] text-muted" />
    ),
    code: (props: React.HTMLAttributes<HTMLElement>) => (
      <code {...props} className="bg-surface px-1 py-0.5 font-mono text-[0.875em] text-ink [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-muted" />
    ),
    table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
      <div className="my-2 overflow-x-auto">
        <table {...props} className="w-full border-collapse text-left text-sm" />
      </div>
    ),
    th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
      <th {...props} className="meta bg-surface px-4 py-3 font-normal" />
    ),
    td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
      <td {...props} className="border-b border-line px-4 py-4 text-ink [&:not(:first-child)]:font-mono [&:not(:first-child)]:text-muted" />
    ),
  };
}
