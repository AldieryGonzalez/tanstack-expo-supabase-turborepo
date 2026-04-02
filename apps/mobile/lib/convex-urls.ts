const DEFAULT_CONVEX_URL = "http://127.0.0.1:3210";
const DEFAULT_CONVEX_SITE_URL = "http://127.0.0.1:3211";

export const convexUrl =
	process.env.EXPO_PUBLIC_CONVEX_URL ?? DEFAULT_CONVEX_URL;

export const convexSiteUrl =
	process.env.EXPO_PUBLIC_CONVEX_SITE_URL ?? DEFAULT_CONVEX_SITE_URL;
