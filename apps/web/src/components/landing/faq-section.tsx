import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@helsa/ui/components/accordion";
import { Plus } from "lucide-react";

import { Container } from "./container";
import { faqs } from "./content";
import { Reveal } from "./motion/reveal";

export function FaqSection() {
	return (
		<section id="preguntas" className="scroll-mt-16 py-20 lg:py-28">
			<Container className="max-w-3xl">
				<Reveal>
					<h2 className="font-display font-medium text-3xl tracking-tight sm:text-4xl">
						Preguntas frecuentes
					</h2>
				</Reveal>

				<Reveal delay={0.15}>
					<Accordion className="mt-10 border-border border-t">
						{faqs.map((faq) => (
							<AccordionItem
								key={faq.question}
								value={faq.question}
								className="border-border border-b"
							>
								<AccordionTrigger className="items-center py-5 font-medium text-[15px] hover:no-underline [&>[data-slot=accordion-trigger-icon]]:hidden">
									{faq.question}
									<Plus
										aria-hidden="true"
										className="size-4 shrink-0 text-primary transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-45"
									/>
								</AccordionTrigger>
								<AccordionContent className="pb-5 text-muted-foreground text-sm leading-relaxed">
									<p>{faq.answer}</p>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</Reveal>
			</Container>
		</section>
	);
}
