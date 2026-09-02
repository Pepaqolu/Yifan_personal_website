export const productConfig = {
  name: "Meridian",
  shortName: "Meridian",
  tagline: "Find your customers and partners in China.",
  description:
    "AI-powered China market intelligence that finds, scores and tracks real commercial opportunities — with people on the ground when verification matters.",
  email: "yifanevanfu@gmail.com",
  launch: {
    enabled: true,
    date: "2026-09-05T01:00:00.000Z",
    timezone: "Asia/Shanghai",
    preLaunchMessage: "launches in",
    postLaunchMessage: "is live",
    dismissalVersion: "launch-2026-09-05",
  },
  routes: {
    analyze: "/analyze",
    demo: "/meridian/demo",
    login: "/meridian/login",
    app: "/meridian/app",
    trial: "/meridian/trial",
  },
} as const;

export type ProductConfig = typeof productConfig;
