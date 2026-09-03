import Image from "next/image";
import { productConfig } from "@/config/productConfig";

export function MeridianMark({ className = "h-8 w-8" }: { className?: string }) {
  return <span className={`relative inline-block shrink-0 overflow-hidden rounded-full ${className}`} aria-hidden="true">
    <Image src={productConfig.brand.logo} alt="" fill sizes="64px" className="scale-[4.05] object-cover" style={{ objectPosition: "50% 39%" }} priority />
  </span>;
}

export function MeridianBrand({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return <span className={`inline-flex items-center ${compact ? "gap-2" : "gap-3"} ${className}`}>
    <MeridianMark className={compact ? "h-5 w-5" : "h-8 w-8"}/>
    <span className="font-medium tracking-[0.18em]">MERIDIAN</span>
  </span>;
}
