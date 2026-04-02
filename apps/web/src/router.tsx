import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

const convexUrl = (
	import.meta as unknown as { env: { VITE_CONVEX_URL: string } }
).env.VITE_CONVEX_URL;
if (!convexUrl) {
	throw new Error("VITE_CONVEX_URL is not set");
}
const convexQueryClient = new ConvexQueryClient(convexUrl, {
	expectAuth: true,
});
const queryClient: QueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
});
convexQueryClient.connect(queryClient);
// Create a new router instance
export const getRouter = () => {
	const router = createRouter({
		defaultPreload: "intent",
		routeTree,
		context: { queryClient, convexQueryClient },

		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
	});
	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
};
