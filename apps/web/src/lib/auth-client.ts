import { createAuthClient } from "better-auth/react";

const webBaseUrl =
	typeof window !== "undefined"
		? window.location.origin
		: ((process.env.VITE_AUTH_BASE_URL as string | undefined) ??
			"http://localhost:3000");

export const authClient = createAuthClient({
	baseURL: webBaseUrl,
});
