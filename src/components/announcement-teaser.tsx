"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { productConfig } from "@/config/productConfig";
import { AnalyticsLink } from "./analytics-link";

function countdown(target: number, now: number) {
  const total = Math.max(0, target - now);
  const minutes = Math.floor(total / 60000);
  return { total, days: Math.floor(minutes / 1440), hours: Math.floor(minutes % 1440 / 60), minutes: minutes % 60 };
}

export function AnnouncementTeaser() {
  const reduceMotion = useReducedMotion();
  const target = useMemo(()=>new Date(productConfig.launch.date).getTime(),[]);
  const [now,setNow]=useState<number|null>(null);
  const [visible,setVisible]=useState(false);
  const dismissalKey=`meridian-announcement-${productConfig.launch.dismissalVersion}-dismissed`;

  useEffect(()=>{
    const show=()=>{setNow(Date.now());try{setVisible(window.localStorage.getItem(dismissalKey)!=="true");}catch{setVisible(true);}};
    const frame=window.requestAnimationFrame(show);
    const timer=window.setInterval(()=>setNow(Date.now()),30_000);
    return()=>{window.cancelAnimationFrame(frame);window.clearInterval(timer);};
  },[dismissalKey]);

  if(!productConfig.launch.enabled) return null;
  const remaining=countdown(target,now??target);
  const live=now!==null&&remaining.total<=0;
  const dismiss=()=>{try{window.localStorage.setItem(dismissalKey,"true");}catch{}setVisible(false);};

  return <AnimatePresence initial={false}>{visible?<motion.aside aria-label={`${productConfig.name} launch announcement`} initial={{height:0,opacity:0,y:reduceMotion?0:-8}} animate={{height:"auto",opacity:1,y:0}} exit={{height:0,opacity:0,y:reduceMotion?0:-6}} transition={{duration:reduceMotion?0.01:0.58,ease:[0.22,1,0.36,1]}} className="relative overflow-hidden border-b border-accent/35 bg-accent text-[#071018]">
    <AnalyticsLink eventName="analyze_clicked" eventLocation="launch-countdown" href={productConfig.routes.analyze} className="group flex min-h-12 items-center justify-center gap-3 px-14 py-2 text-center text-[0.72rem] font-medium tracking-[-0.01em] sm:min-h-[3.25rem] sm:gap-5 sm:px-20 sm:text-[0.78rem]">
      <span className="font-semibold uppercase tracking-[0.04em]">{productConfig.shortName} {live?productConfig.launch.postLaunchMessage:productConfig.launch.preLaunchMessage}</span>
      {!live?<span aria-hidden="true" className="flex items-center gap-2 font-mono text-[0.68rem]"><strong>{String(remaining.days).padStart(2,"0")}D</strong><strong>{String(remaining.hours).padStart(2,"0")}H</strong><strong>{String(remaining.minutes).padStart(2,"0")}M</strong></span>:null}
      {!live?<span className="sr-only">{remaining.days} days, {remaining.hours} hours and {remaining.minutes} minutes until launch on September 5, 2026 at 9 AM Asia Shanghai time.</span>:null}
      <span className="hidden opacity-70 sm:inline">Analyze your China opportunity</span><span aria-hidden="true" className="opacity-70 transition-transform duration-500 group-hover:translate-x-1">→</span>
    </AnalyticsLink>
    <button type="button" onClick={dismiss} aria-label={`Dismiss ${productConfig.name} launch announcement`} className="absolute inset-y-0 right-1 flex w-10 items-center justify-center text-base font-light opacity-50 transition-opacity hover:opacity-100 sm:right-4">×</button>
  </motion.aside>:null}</AnimatePresence>;
}
