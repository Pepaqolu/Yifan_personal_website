import { siteContent } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-dark pb-8 text-paper">
      <div className="page-shell flex items-center justify-between border-t border-paper/10 pt-5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-paper/35">
        <p>© {new Date().getFullYear()} {siteContent.name}</p>
        <p>{siteContent.footer.note}</p>
      </div>
    </footer>
  );
}
