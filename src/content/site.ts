/** Single source of truth for all personal details and website copy. */
export const siteContent = {
  name: "Yifan Fu",
  email: "yifanevanfu@gmail.com",
  meta: {
    title: "Yifan Fu — China ↔ World",
    description: "Yifan Fu works across China, technology, healthcare, and cross-border business, helping international companies navigate the Chinese market.",
    siteUrl: "https://yifan.world",
  },
  navigation: [
    { label: "Between", href: "#between" },
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
    context: "Medical Technology · Shenzhen, China",
    summary: "Worked across product commercialization, marketing, market development and international expansion in China's medical technology industry.",
    focus: "Technology. Healthcare. Commercialization. International markets.",
    metric: "10+",
    metricLabel: "Companies advised",
    metricSummary: "Across market research, China strategy, sourcing, commercialization and cross-border questions.",
  },
  operator: {
    statement: ["I don't study China from the outside.", "I operate inside it."],
    context: "Products. Factories. Hospitals. Distributors. Partners. Customers.",
  },
  advisory: {
    title: "Working on China?",
    audience: "I work best with companies that already have something real — a product, an opportunity, or a question — and need a clearer view of China.",
    services: [
      { number: "01", title: "Market validation", description: "Test the opportunity before committing." },
      { number: "02", title: "Market entry", description: "Turn context into a practical path forward." },
      { number: "03", title: "Partner search", description: "Find and assess the right local relationships." },
      { number: "04", title: "Localization", description: "Adapt the proposition, not just the language." },
      { number: "05", title: "On-the-ground perspective", description: "See what is difficult to read from afar." },
    ],
  },
  becoming: ["Still learning.", "Still building.", "Still becoming."],
  perspective: {
    statement: "I'm interested in the places where technology, markets, culture and people collide.",
    interests: ["AI", "Healthcare", "Technology", "China", "Global Markets", "Entrepreneurship"],
  },
  contact: {
    title: "Thinking about China?",
    prompt: "Have a product, market, or opportunity you're exploring?",
    invitation: "Let's talk.",
    cta: "Start a conversation",
    subject: "China Market Inquiry",
  },
  footer: { note: "China ↔ World" },
} as const;

export type SiteContent = typeof siteContent;
