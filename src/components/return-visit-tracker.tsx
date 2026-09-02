"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

const KEY="meridian-workspace-last-visit";
export function ReturnVisitTracker(){useEffect(()=>{try{const last=Number(window.localStorage.getItem(KEY)||0);if(last&&Date.now()-last>6*60*60*1000)track("return_visit");window.localStorage.setItem(KEY,String(Date.now()));}catch{}},[]);return null;}
