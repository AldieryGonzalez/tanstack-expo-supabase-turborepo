import { expo } from "@better-auth/expo";
import { createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { betterAuth } from "better-auth/minimal";
import { anonymous, magicLink, twoFactor } from "better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { type QueryCtx, query } from "./_generated/server";
import authConfig from "./auth.config";

const betterAuthSecret = process.env.BETTER_AUTH_SECRET as string;
const baseSiteUrl = (process.env.SITE_URL || process.env.CONVEX_SITE_URL) as
	| string
	| undefined;

if (!baseSiteUrl) {
	throw new Error(
		"Missing auth site URL: set SITE_URL (or fallback CONVEX_SITE_URL).",
	);
}

const siteUrl =
	!baseSiteUrl.startsWith("http://") && !baseSiteUrl.startsWith("https://")
		? `http://${baseSiteUrl}`
		: baseSiteUrl;
const siteOrigin = new URL(siteUrl).origin;
const isDevelopment =
	process.env.NODE_ENV !== "production" || !siteUrl.includes(".convex.site");
const additionalTrustedOrigins = (process.env.TRUSTED_ORIGINS ?? "")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);
const mobileScheme =
	(process.env.MOBILE_APP_SCHEME ?? "myapp").replace("://", "").trim() ||
	"myapp";
const mobileTrustedOrigins = isDevelopment
	? [
			"exp://",
			"exp://**",
			"exp://192.168.*.*:*/**",
			"exp://10.0.*.*:*/**",
			"exp://172.*.*.*:*/**",
			"exp://*.local:*/**",
		]
	: [`${mobileScheme}://`, `${mobileScheme}://**`];

export const authComponent = createClient<DataModel>(components.betterAuth);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	betterAuth({
		baseURL: siteUrl,
		secret: betterAuthSecret,
		trustedOrigins: Array.from(
			new Set([
				"http://localhost:3000",
				siteOrigin,
				...additionalTrustedOrigins,
				...mobileTrustedOrigins,
			]),
		),

		database: authComponent.adapter(ctx),
		account: {
			accountLinking: {
				enabled: true,
			},
		},
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			},
		},
		user: {
			deleteUser: {
				enabled: true,
			},
		},
		plugins: [
			expo(),
			crossDomain({
				siteUrl,
			}),
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					// TODO: Plug in your email service (e.g. Resend, SendGrid, etc.)
					console.log(`Magic link for ${email}: ${url}`);
				},
			}),
			twoFactor(),
			anonymous(),
			convex({ authConfig, jwksRotateOnTokenGenerationError: true }),
		],
	});

export const safeGetUser = async (ctx: QueryCtx) => {
	const authUser = await authComponent.safeGetAuthUser(ctx);
	if (!authUser) {
		return;
	}
	return authUser;
};

export const getUser = async (ctx: QueryCtx) => {
	const user = await safeGetUser(ctx);
	if (!user) {
		throw new Error("User not found");
	}
	return user;
};

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		return safeGetUser(ctx);
	},
});
