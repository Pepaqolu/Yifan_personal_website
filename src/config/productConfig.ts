export const productConfig = {
  name: "Meridian",
  shortName: "Meridian",
  tagline: "Find the right companies in China.",
  description:
    "Meridian finds the companies and market signals that matter to your business.",
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
