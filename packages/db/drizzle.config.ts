import "dotenv/config";

import { defineConfig } from "drizzle-kit";
import { localDatabaseUrl } from "./src/config";

export default defineConfig({
	dbCredentials: {
		url: process.env.DATABASE_URL ?? localDatabaseUrl,
	},
	dialect: "postgresql",
	out: "./drizzle",
	schema: "./src/schema.ts",
	verbose: true,
	strict: true,
});
