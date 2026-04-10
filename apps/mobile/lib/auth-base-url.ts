const DEFAULT_AUTH_URL = "http://localhost:3000";

export const authBaseUrl = process.env.EXPO_PUBLIC_AUTH_URL ?? DEFAULT_AUTH_URL;
