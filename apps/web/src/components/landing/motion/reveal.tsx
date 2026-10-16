"use client";

import { type HTMLMotionProps, m, type Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// `custom` carries an optional delay in seconds.
export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 16 },
	show: (delay = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: EASE_OUT, delay },
	}),
};

export const fadeIn: Variants = {
	hidden: { opacity: 0, y: 24, scale: 0.97 },
	show: (delay = 0) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.8, ease: EASE_OUT, delay },
	}),
};

export const growUp: Variants = {
	hidden: { scaleY: 0 },
	show: (delay = 0) => ({
		scaleY: 1,
		transition: { duration: 0.7, ease: EASE_OUT, delay },
	}),
};

const VIEWPORT = { once: true, amount: 0.2 } as const;

type Tag = "div" | "ul" | "ol" | "li" | "dl" | "span" | "p";

type MotionTagProps = Omit<HTMLMotionProps<"div">, "ref"> & { as?: Tag };

function motionTag(as: Tag) {
	return m[as] as typeof m.div;
}

/**
 * Fades and lifts its content in once it scrolls into view.
 * Use `onMount` for above-the-fold content.
 */
export function Reveal({
	as = "div",
	delay = 0,
	onMount = false,
	variants = fadeUp,
	...props
}: MotionTagProps & { delay?: number; onMount?: boolean }) {
	const Component = motionTag(as);
	return (
		<Component
			initial="hidden"
			{...(onMount
				? { animate: "show" }
				: { whileInView: "show", viewport: VIEWPORT })}
			variants={variants}
			custom={delay}
			{...props}
		/>
	);
}

type Trigger = "inView" | "mount" | "inherit";

/**
 * Staggers its `RevealItem` children. With `trigger="inherit"` it waits for a
 * parent group, so groups can be nested.
 */
export function RevealGroup({
	as = "div",
	trigger = "inView",
	stagger = 0.08,
	delay = 0,
	...props
}: MotionTagProps & { trigger?: Trigger; stagger?: number; delay?: number }) {
	const Component = motionTag(as);
	const triggerProps =
		trigger === "mount"
			? { initial: "hidden", animate: "show" }
			: trigger === "inView"
				? { initial: "hidden", whileInView: "show", viewport: VIEWPORT }
				: {};

	return (
		<Component
			{...triggerProps}
			variants={{
				hidden: {},
				show: {
					transition: { staggerChildren: stagger, delayChildren: delay },
				},
			}}
			{...props}
		/>
	);
}

export function RevealItem({
	as = "div",
	variants = fadeUp,
	...props
}: MotionTagProps) {
	const Component = motionTag(as);
	return <Component variants={variants} {...props} />;
}
