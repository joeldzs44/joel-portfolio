import { home } from "@/content/site";
import { Container, Eyebrow, Lines } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";

export function ContactSection({ index }: { index: string }) {
  const { contact } = home;

  return (
    <section id="contact" aria-labelledby="contact-title">
      <Container className="grid gap-12 pb-16 pt-20 md:pt-[88px] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
        <div className="flex flex-col gap-7">
          <Eyebrow>
            {index} / {contact.label}
          </Eyebrow>
          <h2
            id="contact-title"
            className="font-display text-[clamp(2.5rem,1.4rem+3.2vw,4rem)] font-medium leading-[1.08] text-ink [text-wrap:balance]"
          >
            <Lines lines={contact.title} />
          </h2>
          <p className="max-w-[48ch] leading-[1.7] text-muted">{contact.body}</p>
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
