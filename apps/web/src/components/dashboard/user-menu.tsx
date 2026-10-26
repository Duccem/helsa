"use client";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@helsa/ui/components/dropdown-menu";
import { cn } from "@helsa/ui/lib/utils";
import {
	BellRing,
	ChevronDown,
	LogOut,
	Monitor,
	Moon,
	Settings,
	Sun,
	UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth-client";

import { type DashboardUser, initials, roleLabels } from "./navigation";
import { useNotifications } from "./notifications";

const themeOptions = [
	{ value: "light", label: "Claro", icon: Sun },
	{ value: "dark", label: "Oscuro", icon: Moon },
	{ value: "system", label: "Del sistema", icon: Monitor },
] as const;

const itemClass =
	"min-h-11 gap-3 rounded-2xl px-3 text-[15px] focus:bg-dash-ground focus:text-foreground [&_svg:not([class*='size-'])]:size-[1.1rem] [&_svg]:text-muted-foreground";

export function UserAvatar({
	user,
	className,
}: {
	user: Pick<DashboardUser, "name" | "image">;
	className?: string;
}) {
	if (user.image) {
		return (
			<img
				src={user.image}
				alt=""
				className={cn("size-10 shrink-0 rounded-full object-cover", className)}
			/>
		);
	}
	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-chapter-violet font-semibold text-[14px] text-white",
				className,
			)}
		>
			{initials(user.name)}
		</span>
	);
}

export function UserMenu({ user }: { user: DashboardUser }) {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const { muted, setMuted } = useNotifications();
	const [mounted, setMounted] = useState(false);
	const [signingOut, setSigningOut] = useState(false);

	useEffect(() => setMounted(true), []);

	const currentTheme =
		themeOptions.find((option) => option.value === theme) ?? themeOptions[2];
	const ThemeIcon = mounted ? currentTheme.icon : Monitor;

	async function signOut() {
		setSigningOut(true);
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => router.push("/sign-in"),
				onError: () => {
					setSigningOut(false);
					toast.error("No pudimos cerrar tu sesión. Intenta de nuevo.");
				},
			},
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={`Menú de ${user.name}`}
				className="group flex items-center gap-3 rounded-full bg-card p-1 pr-2 outline-none transition-colors duration-200 hover:bg-chapter-lilac focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-chapter-lilac sm:pr-4"
			>
				<UserAvatar user={user} />
				<span className="hidden min-w-0 text-left sm:block">
					<span className="block max-w-[11rem] truncate font-semibold text-[15px] leading-tight">
						{user.name}
					</span>
					<span className="block text-[13px] text-muted-foreground leading-tight">
						{roleLabels[user.role]}
					</span>
				</span>
				<ChevronDown
					aria-hidden="true"
					className="size-4 text-muted-foreground transition-transform duration-200 group-data-popup-open:rotate-180"
				/>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				className="w-72 rounded-3xl bg-popover p-2 shadow-[0_24px_60px_-20px_oklch(0.2_0.06_287/0.35)] ring-0"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className="flex items-center gap-3 rounded-2xl bg-dash-ground px-3 py-3 text-foreground">
						<UserAvatar user={user} />
						<span className="min-w-0">
							<span className="block truncate font-semibold text-[15px]">
								{user.name}
							</span>
							<span className="block truncate text-[13px] text-muted-foreground">
								{user.email}
							</span>
						</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				<DropdownMenuGroup className="mt-2">
					<DropdownMenuItem
						className={itemClass}
						render={<Link href="/dashboard/profile" />}
					>
						<UserRound />
						Mi perfil
					</DropdownMenuItem>
					<DropdownMenuItem
						className={itemClass}
						render={<Link href="/dashboard/settings" />}
					>
						<Settings />
						Configuración
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuGroup className="mt-2">
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className={itemClass}>
							<ThemeIcon />
							<span className="flex-1">Tema</span>
							<span className="text-[14px] text-muted-foreground">
								{mounted ? currentTheme.label : ""}
							</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="w-48 rounded-3xl bg-popover p-2 shadow-[0_24px_60px_-20px_oklch(0.2_0.06_287/0.35)] ring-0">
							<DropdownMenuRadioGroup
								value={mounted ? (theme ?? "system") : "system"}
								onValueChange={(value) => setTheme(String(value))}
							>
								{themeOptions.map((option) => (
									<DropdownMenuRadioItem
										key={option.value}
										value={option.value}
										closeOnClick
										className={cn(itemClass, "pr-9")}
									>
										<option.icon />
										{option.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuCheckboxItem
						checked={!muted}
						onCheckedChange={(checked) => setMuted(!checked)}
						className={cn(itemClass, "pr-9")}
					>
						<BellRing />
						Avisos de notificaciones
					</DropdownMenuCheckboxItem>
				</DropdownMenuGroup>

				<DropdownMenuGroup className="mt-2">
					<DropdownMenuItem
						variant="destructive"
						disabled={signingOut}
						onClick={signOut}
						className={cn(
							itemClass,
							"focus:bg-destructive/10 focus:text-destructive [&_svg]:text-destructive",
						)}
					>
						<LogOut />
						{signingOut ? "Cerrando sesión…" : "Cerrar sesión"}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
