/** Single source of truth for all personal details and website copy. */
export const siteContent = {
  name: "Yifan Fu",
  email: "yifanevanfu@gmail.com",
  meta: {
    title: "Yifan Fu — China ↔ World",
    description: "Yifan Fu works between China and the world, bringing local perspective to cross-border decisions.",
    siteUrl: "", // Add the production URL after deployment.
  },
  navigation: [
    { label: "Between", href: "#between" },
    { label: "Experience", href: "#experience" },
    { label: "Advisory", href: "#advisory" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    name: "YIFAN FU",
    lineOne: "Built between worlds.",
    lineTwo: "Focused on what comes next.",
    axis: "CHINA ↔ WORLD",
  },
  between: {
    leftCharacter: "之",
    rightCharacter: "间",
    label: "BETWEEN",
    statement: "Two lenses. One perspective.",
  },
  bridge: {
    china: "CHINA",
    world: "WORLD",
    joined: "CHINA ↔ WORLD",
    chinese: "连接，不只是翻译。",
    translation: "Connection is more than translation.",
    message: "I help international companies understand the Chinese market, test assumptions, and move with greater context.",
  },
  experience: {
    label: "EXPERIENCE",
    company: "HUMANEOTEC",
    metric: "10+",
    metricLabel: "Companies advised",
    sectors: ["Technology", "Healthcare", "Cross-border business"],
  },
  advisory: {
    title: "Working on China?",
    services: [
      { number: "01", title: "Market validation", description: "Test the opportunity before committing." },
      { number: "02", title: "Market entry", description: "Turn context into a practical path forward." },
      { number: "03", title: "Partner search", description: "Find and assess the right local relationships." },
      { number: "04", title: "Localization", description: "Adapt the proposition, not just the language." },
      { number: "05", title: "On-the-ground perspective", description: "See what is difficult to read from afar." },
    ],
  },
  becoming: ["Still learning.", "Still building.", "Still becoming."],
  contact: {
    title: "Thinking about China?",
    cta: "Start a conversation",
  },
  footer: { note: "China ↔ World" },
} as const;

export type SiteContent = typeof siteContent;
