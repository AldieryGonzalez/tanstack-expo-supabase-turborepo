import {
	convexClient,
	crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import {
	anonymousClient,
	emailOTPClient,
	magicLinkClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const webBaseUrl =
	typeof window !== "undefined"
		? window.location.origin
		: ((process.env.VITE_AUTH_BASE_URL as string | undefined) ??
			"http://localhost:3000");

export const authClient = createAuthClient({
	baseURL: webBaseUrl,
	plugins: [
		convexClient(),
		crossDomainClient(),
		magicLinkClient(),
		emailOTPClient(),
		twoFactorClient(),
		anonymousClient(),
	],
});
