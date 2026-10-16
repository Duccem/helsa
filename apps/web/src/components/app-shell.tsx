import Header from "./header";

export default function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			{children}
		</div>
	);
}
