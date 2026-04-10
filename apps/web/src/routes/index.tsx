import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const getGoogleAuthErrorMessage = (message: string | undefined) => {
	if (message?.includes("Provider not found")) {
		return "Google OAuth is not configured on the server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.";
	}

	return message ?? "Google sign-in failed.";
};

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { data: session, isPending } = authClient.useSession();
	const [isWorking, setIsWorking] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isGoogleAuthEnabled, setIsGoogleAuthEnabled] = useState<
		boolean | null
	>(null);

	useEffect(() => {
		let cancelled = false;

		const loadAuthConfig = async () => {
			try {
				const response = await fetch("/api/auth/config");
				if (!response.ok) {
					throw new Error("Failed to load auth config.");
				}
				const data = (await response.json()) as {
					googleAuthEnabled?: boolean;
				};
				if (!cancelled) {
					setIsGoogleAuthEnabled(Boolean(data.googleAuthEnabled));
				}
			} catch {
				if (!cancelled) {
					setIsGoogleAuthEnabled(true);
				}
			}
		};

		void loadAuthConfig();

		return () => {
			cancelled = true;
		};
	}, []);

	const signInWithGoogle = async () => {
		if (!isGoogleAuthEnabled) {
			setErrorMessage(
				"Google OAuth is not configured on the server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
			);
			return;
		}
		setIsWorking(true);
		setErrorMessage(null);
		const callbackURL =
			typeof window !== "undefined"
				? `${window.location.origin}/`
				: "http://localhost:3000/";
		const { error } = await authClient.signIn.social({
			provider: "google",
			callbackURL,
		});
		if (error) {
			setErrorMessage(getGoogleAuthErrorMessage(error.message));
		}
		setIsWorking(false);
	};

	const signOut = async () => {
		setIsWorking(true);
		setErrorMessage(null);
		const { error } = await authClient.signOut();
		if (error) {
			setErrorMessage(error.message ?? "Sign-out failed.");
		}
		setIsWorking(false);
	};

	const busy = isPending || isWorking || isGoogleAuthEnabled === null;

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
			<h1 className="text-3xl font-bold">Web Auth Test</h1>
			<p className="text-muted-foreground">
				{isPending
					? "Loading..."
					: session
						? `Signed in as ${session.user.name || session.user.email}`
						: "Not signed in"}
			</p>
			<div className="flex items-center gap-3">
				<button
					className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
					disabled={busy || !isGoogleAuthEnabled}
					onClick={() => void signInWithGoogle()}
					type="button"
				>
					{isGoogleAuthEnabled === false
						? "Google OAuth unavailable"
						: "Sign in with Google"}
				</button>
				<button
					className="rounded-md border border-border px-4 py-2 disabled:opacity-50"
					disabled={busy || !session}
					onClick={() => void signOut()}
					type="button"
				>
					Sign out
				</button>
			</div>
			{isGoogleAuthEnabled === false ? (
				<p className="text-sm text-muted-foreground">
					Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on the web app to
					enable Google sign-in.
				</p>
			) : null}
			{errorMessage ? (
				<p className="text-sm text-red-600">{errorMessage}</p>
			) : null}
		</div>
	);
}
