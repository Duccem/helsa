import Link from "next/link";

import { Logo } from "@/components/landing/logo";

/** Full-screen message for a session link that can't be opened. Server-safe. */
export function SessionNotice({
	title,
	body,
	action,
}: {
	title: string;
	body: string;
	action?: { href: string; label: string };
}) {
	return (
		<div className="flex min-h-svh flex-col bg-night text-white">
			<header className="flex h-16 items-center px-4 sm:px-6">
				<Logo tone="light" className="h-6" eager />
			</header>
			<main className="flex flex-1 items-center justify-center px-4 pb-16">
				<div className="w-full max-w-md">
					<h1 className="font-display font-medium text-[2rem] leading-[1.1] tracking-[-0.02em]">
						{title}
					</h1>
					<p className="mt-3 text-[16px] text-white/85 leading-relaxed">
						{body}
					</p>
					{action ? (
						<Link
							// Built from our own path; typed routes can't know the query.
							href={action.href as never}
							className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 font-semibold text-[15px] text-night outline-none hover:bg-white/85 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night"
						>
							{action.label}
						</Link>
					) : null}
				</div>
			</main>
		</div>
	);
}
