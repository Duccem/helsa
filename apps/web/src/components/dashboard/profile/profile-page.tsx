"use client";

import { cn } from "@helsa/ui/lib/utils";
import { m } from "motion/react";
import { useEffect, useState } from "react";

import { roleLabels } from "../navigation";
import { itemIn, panelIn, stagger } from "../therapist/parts";
import { AvatarPicker } from "./avatar-picker";
import { DeleteAccount } from "./delete-account";
import { DetailsForm } from "./details-form";
import { PasswordForm } from "./password-form";
import { SessionsList } from "./sessions-list";
import { SignInMethods } from "./sign-in-methods";
import type { ProfileAccount, ProfileSession, ProfileUser } from "./types";

const sections = [
	{ id: "datos", label: "Datos personales" },
	{ id: "contrasena", label: "Contraseña" },
	{ id: "sesiones", label: "Sesiones abiertas" },
	{ id: "acceso", label: "Formas de entrar" },
	{ id: "eliminar", label: "Eliminar cuenta" },
] as const;

const monthYear = new Intl.DateTimeFormat("es", {
	month: "long",
	year: "numeric",
});

/** Highlights the section that holds the middle of the screen. */
function useActiveSection() {
	const [active, setActive] = useState<string>(sections[0].id);
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) setActive(entry.target.id);
				}
			},
			{ rootMargin: "-45% 0px -50% 0px" },
		);
		for (const { id } of sections) {
			const element = document.getElementById(id);
			if (element) observer.observe(element);
		}
		return () => observer.disconnect();
	}, []);
	return active;
}

function SectionIndex() {
	const active = useActiveSection();
	return (
		<nav aria-label="Partes del perfil" className="sticky top-24">
			<ul className="grid gap-1">
				{sections.map((section) => {
					const current = active === section.id;
					return (
						<li key={section.id}>
							<a
								href={`#${section.id}`}
								aria-current={current ? "location" : undefined}
								className={cn(
									"relative flex h-11 items-center rounded-full px-4 font-medium text-[15px] outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
									current ? "text-foreground" : "text-foreground/65",
								)}
							>
								{current ? (
									<m.span
										layoutId="profile-index"
										aria-hidden="true"
										className="absolute inset-0 rounded-full bg-card"
										transition={{ type: "spring", stiffness: 420, damping: 34 }}
									/>
								) : null}
								<span className="relative">{section.label}</span>
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

export function ProfilePage({
	user,
	accounts,
	sessions,
}: {
	user: ProfileUser;
	accounts: ProfileAccount[];
	sessions: ProfileSession[];
}) {
	const hasPassword = accounts.some(
		(account) => account.providerId === "credential",
	);

	const facts = [
		{
			value: String(accounts.length),
			label: accounts.length === 1 ? "forma de entrar" : "formas de entrar",
			href: "#acceso",
		},
		{
			value: String(sessions.length),
			label: sessions.length === 1 ? "sesión abierta" : "sesiones abiertas",
			href: "#sesiones",
		},
	];

	return (
		<m.div
			initial="hidden"
			animate="show"
			variants={stagger(0.08)}
			className="mx-auto max-w-[96rem]"
		>
			<m.header variants={itemIn} className="pt-2 pb-8">
				<h1 className="font-display font-medium text-[clamp(2.25rem,4vw,3.5rem)] leading-[1] tracking-[-0.03em]">
					Mi perfil
				</h1>
				<p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed">
					Tus datos, tu contraseña y los equipos donde tienes la cuenta abierta.
				</p>
			</m.header>

			<m.section
				variants={panelIn}
				aria-label="Tu cuenta"
				className="grid grid-cols-[minmax(0,1fr)] gap-8 rounded-[1.75rem] bg-chapter-lilac p-6 sm:p-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-10"
			>
				<AvatarPicker name={user.name} image={user.image} />

				<m.div variants={stagger(0.06, 0.15)} className="min-w-0">
					<m.p
						variants={itemIn}
						className="text-balance break-words font-display font-medium text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.025em]"
					>
						{user.name}
					</m.p>
					<m.p variants={itemIn} className="mt-2 truncate text-[17px]">
						{user.email}
					</m.p>
					<m.p
						variants={itemIn}
						className="mt-1 text-[15px] text-foreground/75"
					>
						{roleLabels[user.role]} · En Helsa desde{" "}
						{monthYear.format(new Date(user.createdAt))}
					</m.p>
					<m.p
						variants={itemIn}
						className="mt-4 max-w-[46ch] text-[14px] text-foreground/75"
					>
						Toca tu foto o arrastra una imagen encima para cambiarla. JPG, PNG o
						WebP de hasta 2 MB.
					</m.p>
				</m.div>

				<m.dl
					variants={stagger(0.06, 0.25)}
					className="grid grid-cols-2 gap-2 lg:w-[22rem]"
				>
					{facts.map((fact) => (
						<m.div
							key={fact.label}
							variants={itemIn}
							className="flex flex-col rounded-[1.25rem] bg-card p-4 sm:p-5"
						>
							<dt className="order-2 mt-2 text-[15px]">
								<a
									href={fact.href}
									className="rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
								>
									{fact.label}
								</a>
							</dt>
							<dd className="order-1 font-display font-medium text-[2.5rem] tabular-nums leading-none tracking-[-0.02em]">
								{fact.value}
							</dd>
						</m.div>
					))}
				</m.dl>
			</m.section>

			<div className="mt-4 grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-8">
				<m.aside variants={itemIn} className="hidden xl:block">
					<SectionIndex />
				</m.aside>

				<div className="grid min-w-0 gap-4">
					<DetailsForm user={user} />
					<PasswordForm hasPassword={hasPassword} />
					<SessionsList sessions={sessions} />
					<SignInMethods email={user.email} accounts={accounts} />
					<DeleteAccount
						email={user.email}
						role={user.role}
						hasPassword={hasPassword}
					/>
				</div>
			</div>
		</m.div>
	);
}
