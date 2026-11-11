/*
 * Submits Helsa's WhatsApp templates to Meta through Kapso, or shows their
 * review status. Meta must approve a template before it can be sent.
 *
 *   pnpm kapso:templates           submit the ones that don't exist yet
 *   pnpm kapso:templates status    show each template's review status
 *
 * Needs KAPSO_API_KEY and KAPSO_BUSINESS_ACCOUNT_ID.
 */
import {
	toMetaTemplate,
	whatsappTemplateDefinitions,
} from "../src/lib/infra/messaging/whatsapp-templates";

const GRAPH_VERSION = "v24.0";

const apiKey = process.env.KAPSO_API_KEY;
const wabaId = process.env.KAPSO_BUSINESS_ACCOUNT_ID;
const baseUrl = (
	process.env.KAPSO_BASE_URL ?? "https://api.kapso.ai/meta/whatsapp"
).replace(/\/$/, "");

if (!apiKey || !wabaId) {
	console.error("Set KAPSO_API_KEY and KAPSO_BUSINESS_ACCOUNT_ID first.");
	process.exit(1);
}

const endpoint = `${baseUrl}/${GRAPH_VERSION}/${wabaId}/message_templates`;
const headers = { "X-API-Key": apiKey, "Content-Type": "application/json" };

type TemplateRow = {
	name: string;
	status: string;
	language: string;
	rejected_reason?: string;
};

async function existing(): Promise<TemplateRow[]> {
	const response = await fetch(
		`${endpoint}?limit=200&fields=name,status,language,rejected_reason`,
		{
			headers,
			redirect: "error",
		},
	);
	if (!response.ok)
		throw new Error(
			`List failed (${response.status}): ${await response.text()}`,
		);
	const body = (await response.json()) as { data?: TemplateRow[] };
	return body.data ?? [];
}

async function status() {
	const rows = await existing();
	for (const definition of whatsappTemplateDefinitions) {
		const row = rows.find((item) => item.name === definition.name);
		const detail =
			row?.rejected_reason && row.rejected_reason !== "NONE"
				? ` (${row.rejected_reason})`
				: "";
		console.log(
			`${definition.name}: ${row ? row.status : "NOT SUBMITTED"}${detail}`,
		);
	}
}

async function submit() {
	const rows = await existing();
	for (const definition of whatsappTemplateDefinitions) {
		if (rows.some((item) => item.name === definition.name)) {
			console.log(`${definition.name}: already exists, skipped`);
			continue;
		}
		const response = await fetch(endpoint, {
			method: "POST",
			headers,
			redirect: "error",
			body: JSON.stringify(toMetaTemplate(definition)),
		});
		const body = await response.text();
		console.log(
			`${definition.name}: ${response.ok ? "submitted" : `failed (${response.status})`} ${body}`,
		);
	}
}

(process.argv[2] === "status" ? status() : submit()).catch((error) => {
	console.error(error);
	process.exit(1);
});
