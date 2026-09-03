import { siteContent } from "@/content/site";
import { productConfig } from "@/config/productConfig";

export function Footer() {
  return (
    <footer className="bg-dark pb-8 text-paper">
      <div className="page-shell flex items-center justify-between border-t border-paper/10 pt-5 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-paper/35">
        <p>© {new Date().getFullYear()} {siteContent.name}</p>
        {productConfig.brand.meridianXUrl ? <a href={productConfig.brand.meridianXUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">X ↗</a> : <p>{siteContent.footer.note}</p>}
      </div>
    </footer>
  );
}
