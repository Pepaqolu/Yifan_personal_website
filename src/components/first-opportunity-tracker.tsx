"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

export function FirstOpportunityTracker(){useEffect(()=>{try{if(window.localStorage.getItem("meridian-first-opportunity-viewed")!=="true"){track("first_opportunity_viewed");window.localStorage.setItem("meridian-first-opportunity-viewed","true");}}catch{}},[]);return null;}
