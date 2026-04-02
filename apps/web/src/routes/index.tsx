import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { data: session, isPending } = authClient.useSession();
	const [isWorking, setIsWorking] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const signInWithGoogle = async () => {
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
			setErrorMessage(error.message ?? "Google sign-in failed.");
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
					disabled={isPending || isWorking}
					onClick={() => void signInWithGoogle()}
					type="button"
				>
					Sign in with Google
				</button>
				<button
					className="rounded-md border border-border px-4 py-2 disabled:opacity-50"
					disabled={isPending || isWorking || !session}
					onClick={() => void signOut()}
					type="button"
				>
					Sign out
				</button>
			</div>
			{errorMessage ? (
				<p className="text-sm text-red-600">{errorMessage}</p>
			) : null}
		</div>
	);
}
