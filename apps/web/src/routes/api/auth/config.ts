import { createFileRoute } from "@tanstack/react-router";
import { isGoogleAuthConfigured } from "@/lib/auth-server";

export const Route = createFileRoute("/api/auth/config")({
	server: {
		handlers: {
			GET: () =>
				Response.json({
					googleAuthEnabled: isGoogleAuthConfigured,
				}),
		},
	},
});
