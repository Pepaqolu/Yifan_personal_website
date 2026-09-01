import { siteContent } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-paper pb-8">
      <div className="page-shell flex items-center justify-between border-t border-line pt-5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-stone">
        <p>© {new Date().getFullYear()} {siteContent.name}</p>
        <p>{siteContent.footer.note}</p>
      </div>
    </footer>
  );
}
