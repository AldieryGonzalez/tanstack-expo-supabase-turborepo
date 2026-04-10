import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { localDatabaseUrl } from "./config";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? localDatabaseUrl;
const useSsl =
	process.env.DATABASE_SSL === "false" || !process.env.DATABASE_URL
		? false
		: "require";

export const client = postgres(databaseUrl, {
	prepare: false,
	ssl: useSsl,
});

export const db = drizzle(client, { schema });
