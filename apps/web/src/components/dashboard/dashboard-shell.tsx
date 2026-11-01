"use client";

import { Sheet, SheetContent, SheetTitle } from "@helsa/ui/components/sheet";
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { domMax, LazyMotion, MotionConfig } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import type { DashboardUser, NavBadges } from "./navigation";
import { NotificationsButton, NotificationsProvider } from "./notifications";
import { SidebarNav } from "./sidebar-nav";
import { SIDEBAR_COOKIE } from "./sidebar-state";
import { UserMenu } from "./user-menu";

function SearchField() {
	return (
		<search className="relative w-full max-w-md">
			<form onSubmit={(event) => event.preventDefault()}>
				<label htmlFor="dashboard-search" className="sr-only">
					Buscar pacientes, notas o citas
				</label>
				<Search
					aria-hidden="true"
					className="pointer-events-none absolute top-1/2 left-4 size-[1.1rem] -translate-y-1/2 text-muted-foreground"
				/>
				<input
					id="dashboard-search"
					type="search"
					placeholder="Buscar pacientes, notas o citas"
					className="h-11 w-full rounded-full bg-card pr-4 pl-11 text-[15px] text-foreground outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</form>
		</search>
	);
}

export function DashboardShell({
	user,
	badges,
	defaultCollapsed = false,
	children,
}: {
	user: DashboardUser;
	badges?: NavBadges;
	/** Read from the cookie on the server, so the first paint has the right width. */
	defaultCollapsed?: boolean;
	children: React.ReactNode;
}) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(defaultCollapsed);

	const toggleCollapsed = useCallback(() => {
		setCollapsed((current) => {
			const next = !current;
			// biome-ignore lint/suspicious/noDocumentCookie: a plain cookie lets the server render the same width.
			document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
			return next;
		});
	}, []);

	// Ctrl/⌘ + B, the usual shortcut for toggling a sidebar.
	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				if (window.matchMedia("(min-width: 1024px)").matches) toggleCollapsed();
				else setMenuOpen((open) => !open);
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [toggleCollapsed]);

	const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

	return (
		<LazyMotion features={domMax} strict>
			<MotionConfig reducedMotion="user">
				<NotificationsProvider>
					<div
						data-sidebar={collapsed ? "collapsed" : "expanded"}
						className="min-h-svh bg-dash-ground text-foreground transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:data-[sidebar=collapsed]:grid-cols-[5.5rem_minmax(0,1fr)]"
					>
						<aside
							id="dashboard-sidebar"
							className="sticky top-0 hidden h-svh overflow-hidden lg:block"
						>
							<SidebarNav user={user} badges={badges} collapsed={collapsed} />
						</aside>

						<Sheet open={menuOpen} onOpenChange={setMenuOpen}>
							<SheetContent
								side="left"
								showCloseButton={false}
								className="w-[18rem] border-r-0 bg-dash-ground p-0 text-foreground"
							>
								<SheetTitle className="sr-only">Menú</SheetTitle>
								<SidebarNav
									user={user}
									badges={badges}
									onNavigate={() => setMenuOpen(false)}
								/>
							</SheetContent>
						</Sheet>

						<div className="flex min-w-0 flex-col">
							<header className="sticky top-0 z-30 bg-dash-ground">
								<div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
									<button
										type="button"
										onClick={() => setMenuOpen(true)}
										aria-label="Abrir menú"
										className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-card outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring active:scale-95 lg:hidden"
									>
										<Menu aria-hidden="true" className="size-5" />
									</button>
									<button
										type="button"
										onClick={toggleCollapsed}
										aria-controls="dashboard-sidebar"
										aria-expanded={!collapsed}
										aria-label={
											collapsed
												? "Expandir menú (Ctrl+B)"
												: "Colapsar menú (Ctrl+B)"
										}
										title={
											collapsed
												? "Expandir menú (Ctrl+B)"
												: "Colapsar menú (Ctrl+B)"
										}
										className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground outline-none transition-[background-color,color,transform] duration-200 hover:bg-chapter-lilac hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-95 lg:inline-flex"
									>
										<ToggleIcon aria-hidden="true" className="size-5" />
									</button>
									<div className="hidden flex-1 sm:block">
										<SearchField />
									</div>
									<div className="ml-auto flex items-center gap-2 sm:gap-3">
										<NotificationsButton />
										<UserMenu user={user} />
									</div>
								</div>
							</header>

							<main
								id="contenido"
								className="flex-1 px-4 pb-10 sm:px-6 lg:px-8"
							>
								{children}
							</main>
						</div>
					</div>
				</NotificationsProvider>
			</MotionConfig>
		</LazyMotion>
	);
}
