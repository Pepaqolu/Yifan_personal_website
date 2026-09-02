export const productConfig = {
  name: "Meridian",
  shortName: "Meridian",
  tagline: "Find your customers and partners in China.",
  description:
    "AI-powered market intelligence and opportunity discovery, built on Chinese data and backed by people on the ground when you need them.",
  email: "yifanevanfu@gmail.com",
  routes: {
    analyze: "/analyze",
    demo: "/meridian/demo",
    login: "/meridian/login",
    app: "/meridian/app",
  },
} as const;

export type ProductConfig = typeof productConfig;
