import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { authBaseUrl } from "@/lib/auth-base-url";

if (!process.env.EXPO_PUBLIC_AUTH_URL) {
	console.warn(
		`[auth] EXPO_PUBLIC_AUTH_URL is not set. Using fallback: ${authBaseUrl}`,
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
	],
});
