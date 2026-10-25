// TEMPORARY visual check of the settings page with sample data. Delete before committing.
import { figtree, outfit } from "@/lib/fonts";

import { PreviewShell } from "./shell";

export default function Page() {
	return (
		<div className={`${outfit.variable} ${figtree.variable}`}>
			<PreviewShell />
		</div>
	);
}
