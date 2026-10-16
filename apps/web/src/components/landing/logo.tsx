import { cn } from "@helsa/ui/lib/utils";
import Image from "next/image";

type Tone = "auto" | "light";

type LogoProps = {
	className?: string;
	/** "auto" follows the color scheme; "light" is always white, for dark backgrounds. */
	tone?: Tone;
	eager?: boolean;
};

function ToneImages({
	black,
	white,
	alt,
	width,
	height,
	className,
	tone = "auto",
	eager,
}: LogoProps & {
	black: string;
	white: string;
	alt: string;
	width: number;
	height: number;
}) {
	const loading = eager ? "eager" : undefined;

	if (tone === "light") {
		return (
			<Image
				src={white}
				alt={alt}
				width={width}
				height={height}
				loading={loading}
				className={cn("w-auto", className)}
			/>
		);
	}

	return (
		<>
			<Image
				src={black}
				alt={alt}
				width={width}
				height={height}
				loading={loading}
				className={cn("w-auto dark:hidden", className)}
			/>
			<Image
				src={white}
				alt={alt}
				width={width}
				height={height}
				loading={loading}
				className={cn("hidden w-auto dark:block", className)}
			/>
		</>
	);
}

export function Logo({ className, ...props }: LogoProps) {
	return (
		<ToneImages
			black="/images/helsa-black.png"
			white="/images/helsa-white.png"
			alt="Helsa"
			width={2846}
			height={920}
			className={cn("h-6", className)}
			{...props}
		/>
	);
}

export function LogoMark({ className, ...props }: LogoProps) {
	return (
		<ToneImages
			black="/images/helsa-iso-black.png"
			white="/images/helsa-iso-white.png"
			alt=""
			width={714}
			height={890}
			className={cn("h-6", className)}
			{...props}
		/>
	);
}

export function LogoAppIcon({
	className,
	eager,
}: Pick<LogoProps, "className" | "eager">) {
	return (
		<Image
			src="/images/logo-mobile-helsa.png"
			alt="Helsa"
			width={2800}
			height={2800}
			loading={eager ? "eager" : undefined}
			className={cn("size-9 rounded-[22%]", className)}
		/>
	);
}
