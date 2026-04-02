import { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { authClient } from "@/lib/auth-client";

export default function Index() {
	const { data: session, isPending } = authClient.useSession();
	const [isWorking, setIsWorking] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const signInWithGoogle = async () => {
		setIsWorking(true);
		setErrorMessage(null);
		const { error } = await authClient.signIn.social({
			provider: "google",
			callbackURL: "/",
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

	const busy = isPending || isWorking;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Mobile Auth Test</Text>
			<Text style={styles.subtitle}>
				{isPending
					? "Loading..."
					: session
						? `Signed in as ${session.user.name || session.user.email}`
						: "Not signed in"}
			</Text>
			<View style={styles.actions}>
				<Pressable
					disabled={busy}
					onPress={() => void signInWithGoogle()}
					style={[styles.primaryButton, busy && styles.disabledButton]}
				>
					<Text style={styles.primaryButtonText}>Sign in with Google</Text>
				</Pressable>
				<Pressable
					disabled={busy || !session}
					onPress={() => void signOut()}
					style={[
						styles.secondaryButton,
						(busy || !session) && styles.disabledButton,
					]}
				>
					<Text style={styles.secondaryButtonText}>Sign out</Text>
				</Pressable>
			</View>
			{busy ? <ActivityIndicator /> : null}
			{errorMessage ? (
				<Text style={styles.errorText}>{errorMessage}</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		gap: 12,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
	},
	subtitle: {
		fontSize: 16,
		color: "#4b5563",
		textAlign: "center",
	},
	actions: {
		width: "100%",
		maxWidth: 360,
		gap: 10,
	},
	primaryButton: {
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: "#111827",
	},
	primaryButtonText: {
		textAlign: "center",
		color: "#ffffff",
		fontWeight: "600",
		fontSize: 16,
	},
	secondaryButton: {
		borderRadius: 10,
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: "#d1d5db",
		backgroundColor: "#ffffff",
	},
	secondaryButtonText: {
		textAlign: "center",
		color: "#111827",
		fontWeight: "600",
		fontSize: 16,
	},
	disabledButton: {
		opacity: 0.5,
	},
	errorText: {
		color: "#dc2626",
		fontSize: 14,
		textAlign: "center",
	},
});
