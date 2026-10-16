import type { Feature } from "./content";

export function FeatureCard({ icon: Icon, title, description }: Feature) {
	return (
		<article className="flex h-full flex-col rounded-[1.25rem] border border-border/70 bg-card p-6 transition-colors hover:border-primary/30">
			<span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<Icon aria-hidden="true" className="size-[18px]" />
			</span>
			<h3 className="mt-6 font-display font-medium text-lg leading-snug">
				{title}
			</h3>
			<p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
				{description}
			</p>
		</article>
	);
}
