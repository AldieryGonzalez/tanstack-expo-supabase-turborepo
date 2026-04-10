import { expo } from "@better-auth/expo";
import * as schema from "@monorepo/db";
import { db } from "@monorepo/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

const authBaseUrl =
	process.env.BETTER_AUTH_URL ??
	process.env.VITE_AUTH_BASE_URL ??
	"http://localhost:3000";

const trustedOrigins = [
	authBaseUrl,
	...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean),
];

const mobileAppScheme = process.env.MOBILE_APP_SCHEME ?? "myapp";

if (!trustedOrigins.includes(`${mobileAppScheme}://`)) {
	trustedOrigins.push(`${mobileAppScheme}://`, `${mobileAppScheme}://*`);
}

if (process.env.NODE_ENV !== "production") {
	trustedOrigins.push("exp://", "exp://**");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const isGoogleAuthConfigured = Boolean(
	googleClientId && googleClientSecret,
);
const socialProviders = isGoogleAuthConfigured
	? {
			google: {
				clientId: googleClientId as string,
				clientSecret: googleClientSecret as string,
			},
		}
	: undefined;

if (!isGoogleAuthConfigured && process.env.NODE_ENV !== "production") {
	console.warn(
		"[auth] Google OAuth is disabled. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.",
	);
}

export const auth = betterAuth({
	baseURL: authBaseUrl,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
		usePlural: false,
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	trustedOrigins,
	socialProviders,
	plugins: [expo()],
});

export const handler = auth.handler;
