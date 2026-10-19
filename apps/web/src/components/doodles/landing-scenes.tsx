"use client";

import {
	accent,
	dark,
	Heart,
	ink,
	leaf,
	Plant,
	paper,
	Squiggle,
	Svg,
	soft,
	warm,
} from "./primitives";

/** A thick limb: an ink outline with a coloured core. */
function Limb({ d, color }: { d: string; color: string }) {
	return (
		<>
			<path
				d={d}
				fill="none"
				stroke="currentColor"
				strokeWidth={19}
				strokeLinecap="round"
			/>
			<path
				d={d}
				fill="none"
				stroke={color}
				strokeWidth={13}
				strokeLinecap="round"
			/>
		</>
	);
}

/** Hero: 7:30 in Caracas, El Ávila in the window, the first patient confirms. */
export function DeskDoodle() {
	return (
		<Svg
			viewBox="0 0 580 400"
			label="Dibujo de una psicóloga en su escritorio frente a la laptop, con El Ávila en la ventana y un mensaje de WhatsApp confirmado"
		>
			<ellipse cx="300" cy="376" rx="260" ry="14" fill={soft} />
			<Plant x={30} y={330} scale={0.9} />

			<g {...ink}>
				{/* Window with El Ávila */}
				<rect x="60" y="34" width="180" height="150" rx="10" fill={paper} />
				<circle cx="196" cy="74" r="14" fill={warm} />
				<path
					d="M64 162 L104 104 L130 126 L168 84 L236 150 V180 H64 Z"
					fill={leaf}
				/>
				<path d="M150 34 V184" />

				{/* Chat bubble: the patient confirmed */}
				<path
					d="M470 70 H550 Q562 70 562 82 V114 Q562 126 550 126 H516 L500 142 L502 126 H470 Q458 126 458 114 V82 Q458 70 470 70 Z"
					fill={paper}
				/>
				<path
					d="M482 98 l7 7 l13 -14 M498 98 l7 7 l13 -14"
					stroke={accent}
					strokeWidth={4}
				/>

				{/* Chair and therapist, seen from the side */}
				<rect x="150" y="176" width="40" height="140" rx="18" fill={soft} />
				<rect x="160" y="262" width="104" height="38" rx="14" fill={soft} />
				<path d="M170 300 L164 368 M250 300 L256 368" />
				<path d="M190 266 Q186 212 220 204 Q252 212 256 266 Z" fill={accent} />
				<path d="M206 256 H300 V278 H206 Z" fill={dark} />
				<rect x="280" y="268" width="20" height="92" rx="8" fill={dark} />
				<ellipse cx="302" cy="364" rx="17" ry="7" fill={dark} />
				<circle cx="224" cy="176" r="25" fill={paper} />
				<path
					d="M198 186 Q188 146 224 146 Q256 146 250 172 Q236 160 222 166 Q206 172 206 196 Q200 196 198 186 Z"
					fill={dark}
				/>
				<path d="M238 174 q4 3 8 0 M240 189 q4 3 7 -1" />

				{/* Laptop, the patient on screen */}
				<path
					d="M352 150 H492 Q500 150 500 158 V262 H344 V158 Q344 150 352 150 Z"
					fill={dark}
				/>
				<rect x="356" y="162" width="132" height="92" rx="4" fill={paper} />
				<path d="M394 254 Q394 226 422 222 Q450 226 450 254 Z" fill={leaf} />
				<circle cx="422" cy="202" r="16" fill={paper} />
				<path
					d="M406 204 Q402 182 422 182 Q444 182 438 204 Q432 194 422 194 Q412 194 406 204 Z"
					fill={dark}
				/>
				<path d="M416 210 q6 4 12 0" strokeWidth={2.5} />

				{/* Desk */}
				<rect x="200" y="262" width="360" height="14" rx="6" fill={soft} />
				<path d="M226 276 V368 M534 276 V368" />
				<path d="M320 262 H520" />

				{/* Mug */}
				<path d="M514 228 h28 v26 q0 6 -6 6 h-16 q-6 0 -6 -6 Z" fill={warm} />
			</g>

			<Limb d="M236 222 Q270 252 330 252" color={accent} />
			<circle cx="334" cy="252" r="9" fill={paper} {...ink} />

			<Squiggle d="M522 216 q-7 -8 0 -16 q7 -8 0 -16" delay={1.1} />
			<Squiggle d="M456 132 C430 150 470 160 444 176" dashed delay={0.8} />
		</Svg>
	);
}

/** Expediente: the patient's file on top of the stack, signed. */
export function FolderDoodle() {
	return (
		<Svg
			viewBox="0 0 480 380"
			label="Dibujo de carpetas de expedientes con la ficha de un paciente firmada y un bolígrafo"
		>
			<ellipse cx="240" cy="352" rx="200" ry="12" fill={soft} />
			<g {...ink}>
				<path
					transform="rotate(-7 240 230)"
					d="M86 112 H180 L200 134 H392 Q404 134 404 146 V330 H74 V124 Q74 112 86 112 Z"
					fill={soft}
				/>
				<path
					transform="rotate(4 240 230)"
					d="M86 122 H180 L200 144 H392 Q404 144 404 156 V336 H74 V134 Q74 122 86 122 Z"
					fill={accent}
				/>
				<g transform="rotate(-2 245 230)">
					<rect x="130" y="96" width="230" height="244" rx="8" fill={paper} />
					<circle cx="172" cy="140" r="18" fill={warm} />
					<path
						d="M156 138 Q154 118 172 118 Q190 118 188 138 Q182 128 172 128 Q162 128 156 138 Z"
						fill={dark}
					/>
					<path d="M204 132 h108" strokeWidth={6} />
					<path d="M204 152 h64" />
					<path
						d="M152 192 h180 M152 214 h150 M152 236 h168 M152 266 h110"
						strokeWidth={2.5}
					/>
				</g>
				<path
					d="M338 78 v46 a10 10 0 0 0 20 0 v-40 a6 6 0 0 0 -12 0 v36"
					fill="none"
				/>
				<g transform="rotate(32 400 250)">
					<rect x="392" y="156" width="18" height="128" rx="6" fill={accent} />
					<path d="M392 284 L401 304 L410 284 Z" fill={paper} />
				</g>
			</g>
			<Squiggle d="M160 312 c10 -22 20 10 30 -6 c10 -16 18 6 30 -2 c8 -6 14 2 24 -4" />
		</Svg>
	);
}

/** Videoconsulta: two people, one screen, nothing recorded. */
export function VideoDoodle() {
	return (
		<Svg
			viewBox="0 0 480 380"
			label="Dibujo de una laptop con una videoconsulta entre psicóloga y paciente"
		>
			<ellipse cx="240" cy="352" rx="200" ry="12" fill={soft} />
			<g {...ink}>
				<rect x="80" y="64" width="320" height="214" rx="14" fill={dark} />
				<rect x="96" y="80" width="140" height="182" rx="6" fill={paper} />
				<rect x="244" y="80" width="140" height="182" rx="6" fill={soft} />

				<path d="M128 262 Q128 216 166 210 Q204 216 204 262 Z" fill={leaf} />
				<circle cx="166" cy="176" r="24" fill={paper} />
				<path
					d="M142 178 Q138 148 166 148 Q194 148 190 178 Q184 162 166 162 Q148 162 142 178 Z"
					fill={dark}
				/>
				<path d="M158 184 q8 5 16 0" strokeWidth={2.5} />

				<path d="M276 262 Q276 216 314 210 Q352 216 352 262 Z" fill={accent} />
				<circle cx="314" cy="176" r="24" fill={paper} />
				<path
					d="M288 196 Q280 148 314 148 Q348 148 340 196 Q336 168 314 166 Q294 168 292 198 Z"
					fill={dark}
				/>
				<path d="M306 184 q8 5 16 0" strokeWidth={2.5} />

				<path d="M48 278 H432 L452 302 H28 Z" fill={paper} />
			</g>
			<Heart x={240} y={44} scale={1.3} />
			<Squiggle
				d="M402 58 a30 30 0 0 1 36 0 M410 70 a18 18 0 0 1 20 0"
				delay={0.9}
			/>
		</Svg>
	);
}

/** Cobros: a Pago Móvil confirmed, dollars on one side, bolívares on the other. */
export function PaymentDoodle() {
	return (
		<Svg
			viewBox="0 0 480 380"
			label="Dibujo de un teléfono con un pago móvil confirmado, billetes en dólares y monedas en bolívares"
		>
			<ellipse cx="240" cy="352" rx="200" ry="12" fill={soft} />
			<g {...ink}>
				<g transform="rotate(-12 110 284)">
					<rect x="34" y="248" width="150" height="76" rx="6" fill={leaf} />
					<circle cx="109" cy="286" r="20" fill={paper} />
					<path
						d="M116 276 q-6 -5 -13 0 q-6 6 5 9 q11 3 4 11 q-6 4 -13 -1 M109 270 v32"
						strokeWidth={2.5}
						fill="none"
					/>
				</g>
				<rect x="170" y="44" width="150" height="290" rx="24" fill={dark} />
				<rect x="182" y="62" width="126" height="254" rx="14" fill={paper} />
				<circle cx="245" cy="138" r="28" fill={accent} />
				<path d="M232 138 l9 9 l17 -18" stroke={paper} strokeWidth={5} />
				<path d="M210 196 h70" strokeWidth={7} />
				<path d="M220 218 h50" />
				<rect x="200" y="262" width="90" height="28" rx="14" fill={soft} />

				<path d="M346 300 V324 A42 12 0 0 0 430 324 V300" fill={warm} />
				<ellipse cx="388" cy="300" rx="42" ry="12" fill={warm} />
				<path d="M346 280 V300 A42 12 0 0 0 430 300 V280" fill={warm} />
				<ellipse cx="388" cy="280" rx="42" ry="12" fill={warm} />
				<circle cx="404" cy="206" r="32" fill={warm} />
				<circle cx="404" cy="206" r="21" fill="none" strokeWidth={2.5} />
			</g>
			<text
				x="404"
				y="213"
				textAnchor="middle"
				fontSize="20"
				fontWeight="700"
				fill="currentColor"
				fontFamily="var(--font-display)"
			>
				Bs
			</text>
			<Squiggle
				d="M96 220 C104 130 160 24 250 22 C330 20 392 90 400 160"
				dashed
			/>
		</Svg>
	);
}

/** Privacidad: a closed door, the sign says the session is on. */
export function SessionDoorDoodle() {
	return (
		<Svg
			viewBox="0 0 480 400"
			label="Dibujo de una puerta cerrada con un letrero que dice En sesión, una lámpara y una planta"
		>
			<ellipse cx="240" cy="372" rx="210" ry="14" fill={soft} />
			<Plant x={50} y={318} />
			<g {...ink}>
				<path
					d="M150 360 V60 Q150 48 162 48 H318 Q330 48 330 60 V360 Z"
					fill={accent}
				/>
				<path
					d="M164 360 V70 Q164 62 172 62 H308 Q316 62 316 70 V360 Z"
					fill={soft}
				/>
				<rect
					x="188"
					y="92"
					width="104"
					height="96"
					rx="8"
					fill="none"
					strokeWidth={2.5}
				/>
				<rect
					x="188"
					y="216"
					width="104"
					height="116"
					rx="8"
					fill="none"
					strokeWidth={2.5}
				/>
				<circle cx="296" cy="244" r="8" fill={warm} />
				<path d="M212 158 L240 124 L268 158" fill="none" />
				<circle cx="240" cy="122" r="4" fill={dark} />
				<rect x="186" y="156" width="108" height="48" rx="10" fill={paper} />
				<path d="M164 364 H316" stroke={warm} strokeWidth={7} />

				<path d="M408 360 V150" />
				<path d="M374 150 H442 L426 104 H390 Z" fill={warm} />
				<ellipse cx="408" cy="362" rx="26" ry="7" fill={dark} />
			</g>
			<text
				x="240"
				y="187"
				textAnchor="middle"
				fontSize="19"
				fontWeight="600"
				fill="var(--doodle-dark)"
				fontFamily="var(--font-display)"
			>
				En sesión
			</text>
			<Squiggle
				d="M372 178 L352 196 M408 186 V212 M444 178 L464 196"
				delay={0.7}
			/>
		</Svg>
	);
}

/* Small doodles that sit inside a line of text, word-sized. */

export function ChatChip() {
	return (
		<Svg viewBox="0 0 120 100" label="WhatsApp" className="h-full w-auto">
			<g {...ink}>
				<rect x="34" y="8" width="52" height="86" rx="10" fill={dark} />
				<rect x="40" y="16" width="40" height="70" rx="5" fill={paper} />
				<path
					d="M60 30 H104 Q112 30 112 38 V56 Q112 64 104 64 H86 L76 74 L78 64 H60 Q52 64 52 56 V38 Q52 30 60 30 Z"
					fill={leaf}
				/>
				<path d="M68 47 l5 5 l9 -10 M80 47 l5 5 l9 -10" strokeWidth={3} />
			</g>
		</Svg>
	);
}

export function NotebookChip() {
	return (
		<Svg viewBox="0 0 120 100" label="Notas en papel" className="h-full w-auto">
			<g {...ink} transform="rotate(-8 60 50)">
				<rect x="26" y="10" width="70" height="82" rx="6" fill={paper} />
				<path d="M40 32 h40 M40 48 h32 M40 64 h38" strokeWidth={2.5} />
				<path d="M26 22 h-8 M26 40 h-8 M26 58 h-8 M26 76 h-8" />
			</g>
		</Svg>
	);
}

export function LedgerChip() {
	return (
		<Svg
			viewBox="0 0 120 100"
			label="Libreta de pagos"
			className="h-full w-auto"
		>
			<g {...ink}>
				<rect x="18" y="16" width="72" height="74" rx="6" fill={warm} />
				<path d="M32 36 h44 M32 52 h30 M32 68 h40" strokeWidth={2.5} />
				<circle cx="92" cy="30" r="20" fill={paper} />
			</g>
			<text
				x="92"
				y="37"
				textAnchor="middle"
				fontSize="20"
				fontWeight="700"
				fill="currentColor"
				fontFamily="var(--font-display)"
			>
				$
			</text>
		</Svg>
	);
}
