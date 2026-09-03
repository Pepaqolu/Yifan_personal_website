import { runMedtechBenchmarks, runUniversalBenchmarks } from "../src/lib/meridian-intelligence/benchmarks.ts";

const results=[...runUniversalBenchmarks(),...runMedtechBenchmarks()];
const failed=results.filter((item)=>"overlayMatches" in item?!item.overlayMatches||!item.expectedIntentPresent||!item.avoidsMedtechOnlyQueries:!item.profileComplete||!item.hasChineseQueries||!item.prioritizesDistributors);
for(const item of results)console.log(`${failed.includes(item)?"FAIL":"PASS"} · ${item.name}`);
if(failed.length)process.exitCode=1;
