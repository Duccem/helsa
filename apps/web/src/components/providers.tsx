"use client";

import { Toaster } from "@helsa/ui/components/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ThemeProvider } from "./theme-provider";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			// With SSR, a short stale time avoids refetching right after hydration.
			queries: { staleTime: 60 * 1000 },
		},
	});
}

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(makeQueryClient);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<Toaster richColors />
			</ThemeProvider>
		</QueryClientProvider>
	);
}
