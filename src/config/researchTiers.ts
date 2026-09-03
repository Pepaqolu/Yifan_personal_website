export const researchTiers={
  QUICK:{key:"QUICK",name:"Quick Scan",tokens:5,retailValueUsd:5,targetCogsUsd:.5,warningCogsUsd:.6,hardCogsUsd:.65,maxSearchPaths:1,description:"One focused investigation."},
  STANDARD:{key:"STANDARD",name:"Standard Research",tokens:15,retailValueUsd:15,targetCogsUsd:1.5,warningCogsUsd:1.8,hardCogsUsd:1.95,maxSearchPaths:3,description:"Multi-source China research with cross-checking and opportunity scoring.",recommended:true},
  DEEP:{key:"DEEP",name:"Deep Research",tokens:40,retailValueUsd:40,targetCogsUsd:4,warningCogsUsd:4.8,hardCogsUsd:5.2,maxSearchPaths:6,description:"Broader investigation and deeper verification."},
  INTENSIVE:{key:"INTENSIVE",name:"Intensive Research",tokens:100,retailValueUsd:100,targetCogsUsd:10,warningCogsUsd:12,hardCogsUsd:13,maxSearchPaths:12,description:"Comprehensive multi-angle China intelligence."},
} as const;
export type ResearchTier=keyof typeof researchTiers;
export function isResearchTier(value:string):value is ResearchTier{return value in researchTiers;}
