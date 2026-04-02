import { expoClient } from "@better-auth/expo/client";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { convexSiteUrl } from "@/lib/convex-urls";

const authBaseUrl = convexSiteUrl;

if (!process.env.EXPO_PUBLIC_CONVEX_SITE_URL) {
	console.warn(
		`[auth] EXPO_PUBLIC_CONVEX_SITE_URL is not set. Using fallback: ${authBaseUrl}`,
	);
}

export const authClient = createAuthClient({
	baseURL: authBaseUrl,
	plugins: [
		expoClient({
			scheme: Constants.expoConfig?.scheme as string,
			storagePrefix: Constants.expoConfig?.scheme as string,
			storage: SecureStore,
		}),
		convexClient(),
	],
});
