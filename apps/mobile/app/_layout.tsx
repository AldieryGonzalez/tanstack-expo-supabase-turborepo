import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { convexUrl } from "@/lib/convex-urls";

const convex = new ConvexReactClient(convexUrl, {
	// Optionally pause queries until the user is authenticated
	expectAuth: true,
	unsavedChangesWarning: false,
});
export default function RootLayout() {
	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient}>
			<Stack />
		</ConvexBetterAuthProvider>
	);
}
