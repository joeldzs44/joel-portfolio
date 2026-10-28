import { Action, Container, Eyebrow } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-8 py-24">
      <Eyebrow>404 / Not found</Eyebrow>
      <h1 className="font-display text-[clamp(3rem,1.6rem+5vw,5.5rem)] font-medium leading-[1.04]">
        No page at this address<span className="text-lime">.</span>
      </h1>
      <p className="max-w-[52ch] leading-[1.7] text-muted">
        The link may be out of date, or the page was moved during the redesign.
      </p>
      <Action href="/" arrow="→">
        Back to home
      </Action>
    </Container>
  );
}
