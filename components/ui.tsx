import Link from "next/link";
import { clsx } from "clsx";

export function Container({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("mx-auto w-full max-w-page px-gutter", className)} {...rest}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, tone = "lime", className }: { children: React.ReactNode; tone?: "lime" | "muted"; className?: string }) {
  return <p className={clsx("meta", tone === "lime" && "text-lime", className)}>{children}</p>;
}

type ActionProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  arrow?: "↗" | "→" | "↓" | "+";
  className?: string;
};

export function actionClasses(variant: ActionProps["variant"] = "primary", className?: string) {
  return clsx(
    "group inline-flex h-[52px] items-center justify-between gap-3 border px-4 text-sm sm:gap-7 sm:px-[22px] font-medium transition-colors",
    variant === "primary"
      ? "border-lime bg-lime text-lime-ink hover:bg-ink hover:border-ink"
      : "border-line text-ink hover:border-lime",
    className,
  );
}

export function ActionArrow({ arrow = "↗", variant = "primary" }: Pick<ActionProps, "arrow" | "variant">) {
  return (
    <span
      aria-hidden
      className={clsx(
        "text-xl font-normal transition-transform group-hover:translate-x-0.5",
        arrow === "↗" && "group-hover:-translate-y-0.5",
        variant === "outline" && "text-lime",
      )}
    >
      {arrow}
    </span>
  );
}

export function Action({ href, children, variant = "primary", arrow = "↗", className }: ActionProps) {
  const external = /^https?:/.test(href);
  const classes = actionClasses(variant, className);
  const content = (
    <>
      <span>{children}</span>
      <ActionArrow arrow={arrow} variant={variant} />
    </>
  );

  return external ? (
    <a href={href} className={classes} {...(href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}>
      {content}
    </a>
  ) : (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export function SectionIntro({
  label,
  title,
  aside,
  className,
  as: Heading = "h2",
}: {
  label: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={clsx("flex flex-col gap-6", className)}>
      <Eyebrow>{label}</Eyebrow>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-16">
        <Heading className="section-title flex-1">{title}</Heading>
        {aside && <p className="text-[15px] leading-[1.6] text-muted md:w-[330px] md:shrink-0">{aside}</p>}
      </div>
    </div>
  );
}

// Renders an array of strings as forced line breaks (for display headlines).
export function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
}
