import { siteContent } from "@/content/site";
import { Reveal } from "./reveal";

export function SelectedWork() {
  const projects = siteContent.selectedWork.filter(
    (project) => project.clientType && project.title && project.problem && project.contribution,
  );

  if (projects.length === 0) return null;

  return (
    <section aria-labelledby="selected-work-title" className="bg-paper">
      <div className="page-shell py-36 sm:py-56">
        <p id="selected-work-title" className="eyebrow text-stone">SELECTED WORK</p>
        <div className="mt-16 border-t border-line sm:mt-24">
          {projects.map((project, index) => (
            <Reveal key={`${project.title}-${index}`} className="grid gap-8 border-b border-line py-10 md:grid-cols-12 md:gap-8 md:py-14">
              <p className="eyebrow text-stone md:col-span-3">{project.clientType}</p>
              <div className="md:col-span-7 md:col-start-5">
                <h2 className="text-[clamp(2rem,4vw,4rem)] font-medium leading-[0.96] tracking-[-0.06em]">{project.title}</h2>
                <p className="mt-8 max-w-2xl text-base leading-[1.65] text-charcoal sm:text-lg">{project.problem}</p>
                <p className="mt-4 max-w-2xl text-base leading-[1.65] text-charcoal sm:text-lg">{project.contribution}</p>
                {project.outcome ? <p className="mt-4 max-w-2xl text-sm leading-[1.65] text-stone sm:text-base">{project.outcome}</p> : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
