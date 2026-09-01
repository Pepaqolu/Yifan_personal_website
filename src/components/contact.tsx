import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";
import { AnalyticsLink } from "./analytics-link";

export function Contact() {
  const { contact, email } = siteContent;
  const href = `mailto:${email}?subject=${encodeURIComponent(contact.subject)}`;

  return (
    <section id="contact" className="scroll-mt-16 min-h-[100svh] bg-dark text-paper">
      <div className="page-shell flex min-h-[100svh] flex-col justify-center py-36 sm:py-48">
        <Reveal>
          <h2 className="max-w-[10ch] text-[clamp(4.5rem,11vw,11rem)] font-medium leading-[0.84] tracking-[-0.075em]">{contact.title}</h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-20 sm:mt-28">
          <p className="max-w-xl text-lg leading-[1.55] tracking-[-0.025em] text-paper/55 sm:text-2xl">{contact.prompt}</p>
          <p className="mt-5 text-[clamp(2.3rem,5vw,5rem)] font-medium tracking-[-0.06em]">{contact.invitation}</p>
          <AnalyticsLink eventName="Email clicked" eventLocation="homepage-contact" href={href} className="mt-14 block w-fit break-all text-[clamp(1.2rem,2.6vw,2.6rem)] font-medium tracking-[-0.045em] transition-colors duration-700 hover:text-accent sm:mt-20">{email}</AnalyticsLink>
          <AnalyticsLink eventName="Email clicked" eventLocation="homepage-contact-cta" href={href} className="group mt-8 inline-flex items-center gap-4 text-sm font-medium tracking-[-0.02em] sm:text-base">
            <span className="border-b border-paper/25 pb-1.5 transition-colors duration-700 group-hover:border-accent">{contact.cta}</span>
            <span aria-hidden="true" className="text-accent transition-transform duration-700 group-hover:translate-x-1">→</span>
          </AnalyticsLink>
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-4 border-t border-paper/10 pt-6 sm:mt-20">
            {contact.paths.map((path) => (
              <AnalyticsLink key={path.label} eventName={path.event} eventLocation="homepage-contact-path" href={path.href} className="group inline-flex items-center gap-3 text-sm text-paper/55 transition-colors duration-500 hover:text-paper">
                <span>{path.label}</span><span aria-hidden="true" className="text-accent transition-transform duration-500 group-hover:translate-x-1">→</span>
              </AnalyticsLink>
            ))}
          </div>
          <p className="mt-16 max-w-sm text-sm leading-[1.6] tracking-[-0.015em] text-paper/35 sm:mt-20 sm:text-base">
            {contact.secondary.map((line) => <span key={line} className="block">{line}</span>)}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
