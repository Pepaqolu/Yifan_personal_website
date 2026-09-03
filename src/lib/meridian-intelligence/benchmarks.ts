import { ChinaQueryPlanner } from "./query-planner.ts";
import { ProductIntelligenceService } from "./product-service.ts";

// These fixtures contain product facts and human-supplied terminology only.
// They are deterministic architecture checks, never production search results.
export const medtechBenchmarks = [
  {
    name: "Portable wireless EEG",
    input: {
      productName: "Portable wireless EEG acquisition system",
      productDescription: "Portable system for acquisition of EEG signals in clinical and research settings.",
      intendedUse: "Acquire EEG signals for review by trained clinical users.",
      targetCustomer: "Hospitals, medical-device distributors and clinical research organizations",
      targetDepartment: "Neurology, neurosurgery and neurophysiology",
      businessGoal: "Find distributors in China",
      keywordsEn: ["portable EEG", "wireless EEG", "EEG acquisition"],
      keywordsZh: ["无线脑电", "脑电采集", "脑电图机"],
      formalTermsZh: ["脑电图机"],
      procurementTermsZh: ["医院脑电采购"],
      distributorTermsZh: ["脑电设备经销商", "医疗器械经销商"],
      regulatoryTermsZh: ["医疗器械分类界定", "医疗器械注册"],
    },
  },
  {
    name: "Portable rehabilitation device",
    input: {
      productName: "Portable patient rehabilitation training system",
      productDescription: "Portable device supporting supervised patient rehabilitation training.",
      intendedUse: "Support rehabilitation exercises under professional supervision.",
      targetCustomer: "Hospitals, rehabilitation centers and medical-device distributors",
      targetDepartment: "Rehabilitation medicine and physiotherapy",
      businessGoal: "Find distributors in China",
      keywordsEn: ["rehabilitation training system", "portable rehabilitation device"],
      keywordsZh: ["康复训练设备", "便携式康复设备"],
      formalTermsZh: ["康复训练设备"],
      procurementTermsZh: ["医院康复设备采购"],
      distributorTermsZh: ["康复设备经销商", "医疗器械经销商"],
      regulatoryTermsZh: ["医疗器械分类界定", "医疗器械注册"],
    },
  },
];

export const universalBenchmarks = [
  { name: "Consumer electronics manufacturer search", input: { productName: "Premium smart-home control panel", productDescription: "Consumer electronics product requiring an established contract manufacturer in China.", targetCustomer: "Export-capable electronics manufacturers", objectives: ["suppliers"], businessGoal: "Find manufacturers", keywordsEn: ["smart home control panel"] }, expectedOverlay: "CONSUMER", expectedIntent: "DISCOVER_SUPPLIERS" },
  { name: "B2B industrial distributor and customer search", input: { productName: "Industrial machine-vision inspection system", productDescription: "B2B industrial equipment for factory quality control.", targetCustomer: "Automation distributors and manufacturing plants", objectives: ["distributors", "customers"], businessGoal: "Find distributors and customers", keywordsEn: ["machine vision inspection"] }, expectedOverlay: "INDUSTRIAL", expectedIntent: "DISCOVER_CUSTOMERS" },
];

export function runMedtechBenchmarks() {
  const service = new ProductIntelligenceService();
  const planner = new ChinaQueryPlanner();
  return medtechBenchmarks.map((fixture) => {
    const profile = service.understand(fixture.input);
    const queries = planner.plan(profile);
    return {
      name: fixture.name,
      profileComplete: Boolean(profile.productName && profile.intendedUse && profile.keywordsZh?.length),
      intentCoverage: new Set(queries.map((query) => query.intent)).size,
      hasChineseQueries: queries.some((query) => /[\u3400-\u9fff]/.test(query.query)),
      prioritizesRegulation: queries[0]?.preferredSourceTypes[0] === "AUTHORITATIVE",
      prioritizesDistributors: queries.some((query) => query.intent === "DISCOVER_DISTRIBUTORS" && query.priority === 1),
    };
  });
}

export function runUniversalBenchmarks(){const service=new ProductIntelligenceService();const planner=new ChinaQueryPlanner();return universalBenchmarks.map((fixture)=>{const profile=service.understand(fixture.input);const queries=planner.plan(profile);return{name:fixture.name,overlay:profile.industry,overlayMatches:profile.industry===fixture.expectedOverlay,intentCoverage:queries.map((item)=>item.intent),expectedIntentPresent:queries.some((item)=>item.intent===fixture.expectedIntent),avoidsMedtechOnlyQueries:!queries.some((item)=>item.intent==="FIND_REGULATORY_CLASSIFICATION")};});}
