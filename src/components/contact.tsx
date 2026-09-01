import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";

export function Contact() {
  const { contact, email } = siteContent;
  return (
    <section id="contact" className="scroll-mt-16 min-h-[92svh] bg-paper">
      <div className="page-shell flex min-h-[92svh] flex-col justify-center py-28">
        <Reveal>
          <h2 className="max-w-[11ch] text-[clamp(3.8rem,10.5vw,11rem)] font-medium leading-[0.87] tracking-[-0.075em]">
            {contact.title}
          </h2>
        </Reveal>
        <Reveal delay={0.12} className="mt-20 sm:mt-28">
          <a href={`mailto:${email}`} className="block w-fit text-[clamp(1.25rem,3vw,3rem)] font-medium tracking-[-0.045em] transition-colors duration-500 hover:text-accent">
            {email}
          </a>
          <a href={`mailto:${email}`} className="group mt-7 inline-flex items-center gap-4 text-sm font-medium tracking-[-0.02em] sm:text-base">
            <span className="border-b border-ink/25 pb-1.5 transition-colors duration-500 group-hover:border-accent">{contact.cta}</span>
            <span aria-hidden="true" className="text-accent transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
