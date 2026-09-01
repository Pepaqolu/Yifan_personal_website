import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";

export function Principles() {
  return (
    <section className="bg-paper">
      <div className="page-shell flex min-h-[150svh] flex-col justify-center py-40 sm:py-56">
        {siteContent.becoming.map((line, index) => (
          <Reveal key={line} delay={index * 0.1}>
            <p
              className={`text-[clamp(3.8rem,10vw,10.5rem)] font-medium leading-[0.9] tracking-[-0.075em] ${
                index === 0 ? "" : index === 1 ? "text-charcoal" : "text-stone"
              } ${index > 0 ? "mt-3 sm:mt-5" : ""}`}
            >
              {line}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
