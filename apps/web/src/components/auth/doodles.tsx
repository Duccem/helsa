"use client";

import { m } from "motion/react";

/*
 * Hand-drawn scenes for the auth panel. Strokes use `currentColor` (the
 * foreground ink) and fills read the `--doodle-*` tokens set on the panel,
 * so every scene follows the theme and dark mode on its own.
 */

const paper = "var(--doodle-paper)";
const soft = "var(--doodle-soft)";
const accent = "var(--doodle-accent)";
const warm = "var(--doodle-warm)";
const leaf = "var(--doodle-leaf)";
const dark = "var(--doodle-dark)";

const ink = {
	stroke: "currentColor",
	strokeWidth: 3,
	strokeLinecap: "round",
	strokeLinejoin: "round",
} as const;

/** A loose line that draws itself in, the signature of every scene. */
function Squiggle({
	d,
	delay = 0.35,
	dashed = false,
}: {
	d: string;
	delay?: number;
	dashed?: boolean;
}) {
	return (
		<m.path
			d={d}
			fill="none"
			stroke={accent}
			strokeWidth={3}
			strokeLinecap="round"
			strokeDasharray={dashed ? "2 12" : undefined}
			initial={{ pathLength: 0, opacity: 0 }}
			animate={{ pathLength: 1, opacity: 1 }}
			transition={{
				pathLength: { duration: 1.6, ease: "easeInOut", delay },
				opacity: { duration: 0.2, delay },
			}}
		/>
	);
}

function Plant({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`} {...ink}>
			<path d="M26 0 Q4 -40 14 -76 Q34 -46 26 0 Z" fill={leaf} />
			<path d="M28 0 Q48 -42 64 -54 Q58 -18 28 0 Z" fill={leaf} />
			<path d="M24 0 Q-8 -24 -16 -46 Q14 -38 24 0 Z" fill={leaf} />
			<path d="M0 0 H52 L46 46 H6 Z" fill={warm} />
		</g>
	);
}

function Svg({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<svg
			viewBox="0 0 480 400"
			role="img"
			aria-label={label}
			className="h-auto w-full overflow-visible text-foreground"
		>
			{children}
		</svg>
	);
}

/** Sign in: the therapist settled in the armchair, notebook on the lap. */
export function ArmchairDoodle() {
	return (
		<Svg label="Dibujo de una psicóloga sentada en su sillón con una libreta y una taza de café al lado">
			<ellipse cx="240" cy="340" rx="190" ry="14" fill={soft} />

			<Plant x={46} y={292} />

			<g {...ink}>
				{/* Armchair */}
				<path
					d="M150 304 V172 Q150 122 200 122 H280 Q330 122 330 172 V304 Z"
					fill={soft}
				/>
				<rect x="160" y="262" width="160" height="44" rx="14" fill={soft} />
				<path d="M146 312 L140 338 M334 312 L340 338" />

				{/* Person */}
				<path d="M198 270 Q194 206 240 198 Q286 206 282 270 Z" fill={accent} />
				<circle cx="240" cy="166" r="28" fill={paper} />
				<path
					d="M209 176 Q200 128 240 128 Q282 128 272 178 Q266 158 254 152 Q244 164 220 158 Q212 166 209 176 Z"
					fill={dark}
				/>
				<path d="M226 171 q5 4 10 0 M246 171 q5 4 10 0 M235 183 q5 4 10 0" />
				<rect x="206" y="262" width="68" height="20" rx="8" fill={paper} />
				<rect x="210" y="276" width="24" height="52" rx="8" fill={paper} />
				<rect x="246" y="276" width="24" height="52" rx="8" fill={paper} />
				<ellipse cx="218" cy="332" rx="16" ry="7" fill={dark} />
				<ellipse cx="262" cy="332" rx="16" ry="7" fill={dark} />

				{/* Notebook and pen */}
				<g transform="rotate(-6 241 252)">
					<rect x="214" y="232" width="54" height="38" rx="4" fill={paper} />
					<path d="M224 244 h30 M224 253 h22 M224 262 h26" strokeWidth={2.5} />
				</g>
				<circle cx="212" cy="258" r="8" fill={paper} />
				<circle cx="272" cy="250" r="8" fill={paper} />
				<path d="M274 248 l14 -20" />

				{/* Arms of the chair sit in front of the person */}
				<rect x="124" y="214" width="50" height="96" rx="22" fill={soft} />
				<rect x="306" y="214" width="50" height="96" rx="22" fill={soft} />

				{/* Side table with coffee */}
				<rect x="372" y="258" width="76" height="10" rx="4" fill={soft} />
				<path d="M384 268 L378 338 M436 268 L442 338" />
				<path d="M394 226 h28 v26 q0 6 -6 6 h-16 q-6 0 -6 -6 Z" fill={accent} />
				<path d="M422 232 q12 0 12 9 q0 9 -12 9" fill="none" />
			</g>

			<Squiggle
				d="M402 216 q-7 -8 0 -16 q7 -8 0 -16 M414 214 q-7 -8 0 -16"
				delay={0.9}
			/>
			<Squiggle d="M240 120 C226 100 196 104 194 80 C192 52 228 44 238 64 C246 36 290 36 292 62 C318 54 334 84 314 98 C300 110 280 102 278 90" />
			<path
				d="M256 78 c-4 -6 -14 -2 -10 5 l10 10 l10 -10 c4 -7 -6 -11 -10 -5 Z"
				fill={accent}
				{...ink}
				strokeWidth={2.5}
			/>
		</Svg>
	);
}

function SidePerson({ hair, body }: { hair: string; body: string }) {
	return (
		<g {...ink}>
			{/* Chair */}
			<rect x="58" y="168" width="42" height="142" rx="18" fill={soft} />
			<rect x="76" y="262" width="112" height="42" rx="14" fill={soft} />
			<path d="M84 304 L80 336 M176 304 L180 336" />

			{/* Person, seen from the side, facing right */}
			<path d="M100 266 Q96 214 128 206 Q158 214 162 266 Z" fill={body} />
			<path d="M120 256 H190 V278 H120 Z" fill={dark} />
			<rect x="172" y="268" width="20" height="58" rx="8" fill={dark} />
			<ellipse cx="194" cy="330" rx="16" ry="7" fill={dark} />
			<circle cx="132" cy="178" r="24" fill={paper} />
			<path d={hair} fill={dark} />
			<path d="M144 176 q4 3 8 0 M146 190 q4 3 7 -1" />

			{/* Arm rest in front */}
			<rect x="106" y="238" width="82" height="24" rx="12" fill={soft} />
		</g>
	);
}

/** Sign up: two armchairs facing each other, the first session. */
export function SessionDoodle() {
	return (
		<Svg label="Dibujo de dos personas conversando en sillones, una frente a la otra, con una planta en medio">
			<ellipse cx="240" cy="340" rx="200" ry="14" fill={soft} />

			<SidePerson
				body={accent}
				hair="M108 184 Q100 150 132 150 Q160 150 156 170 Q140 162 128 168 Q116 172 108 184 Z"
			/>
			<g transform="translate(480 0) scale(-1 1)">
				<SidePerson
					body={leaf}
					hair="M106 196 Q96 150 132 150 Q162 150 156 172 Q138 160 124 170 Q114 178 116 200 Q110 200 106 196 Z"
				/>
			</g>

			<g {...ink}>
				<rect x="206" y="276" width="68" height="8" rx="4" fill={soft} />
				<path d="M240 284 V334 M222 336 h36" />
			</g>
			<Plant x={214} y={232} scale={0.95} />

			<g {...ink}>
				<path
					d="M108 56 H196 Q210 56 210 70 V104 Q210 118 196 118 H150 L132 136 L134 118 H108 Q94 118 94 104 V70 Q94 56 108 56 Z"
					fill={paper}
				/>
				<path
					d="M290 34 H372 Q386 34 386 48 V84 Q386 98 372 98 H350 L346 116 L330 98 H290 Q276 98 276 84 V48 Q276 34 290 34 Z"
					fill={paper}
				/>
				<path
					d="M331 60 c-5 -7 -17 -2 -12 6 l12 12 l12 -12 c5 -8 -7 -13 -12 -6 Z"
					fill={accent}
					strokeWidth={2.5}
				/>
			</g>
			<g fill={dark}>
				<circle cx="130" cy="87" r="5" />
				<circle cx="152" cy="87" r="5" />
				<circle cx="174" cy="87" r="5" />
			</g>

			<Squiggle d="M214 92 C236 120 250 60 270 74" dashed />
		</Svg>
	);
}

/** Forgot password: a candle for when the power goes out, a key to find. */
export function CandleKeyDoodle() {
	return (
		<Svg label="Dibujo de una vela encendida, una llave grande y un avión de papel que lleva un mensaje">
			<ellipse cx="240" cy="340" rx="200" ry="14" fill={soft} />

			<g {...ink}>
				{/* Candle */}
				<path
					d="M64 330 Q64 312 120 312 Q176 312 176 330 Q176 340 120 340 Q64 340 64 330 Z"
					fill={soft}
				/>
				<path
					d="M100 318 V226 Q100 218 108 220 Q114 232 120 220 Q126 214 132 222 Q138 230 140 222 V318 Z"
					fill={paper}
				/>
				<path d="M120 220 v-12" />
				<path d="M120 208 Q100 184 120 154 Q140 184 120 208 Z" fill={warm} />
				<path
					d="M120 200 Q112 188 120 176 Q128 188 120 200 Z"
					fill={paper}
					strokeWidth={2}
				/>

				{/* Key */}
				<g transform="rotate(-16 300 252)">
					<circle cx="246" cy="252" r="42" fill={accent} />
					<circle cx="246" cy="252" r="14" fill={paper} />
					<rect x="284" y="242" width="132" height="20" rx="6" fill={accent} />
					<path d="M378 262 v22 h14 v-22 M398 262 v14 h12 v-14" fill={accent} />
				</g>

				{/* Paper plane */}
				<path d="M334 92 L432 58 L388 136 L370 108 Z" fill={paper} />
				<path d="M370 108 L432 58" />
			</g>

			<Squiggle
				d="M84 172 L68 164 M156 172 L172 164 M120 140 V124 M92 146 L82 136 M148 146 L158 136"
				delay={0.9}
			/>
			<Squiggle
				d="M190 150 C214 100 256 160 270 120 C284 80 236 74 254 104 C270 132 306 112 330 98"
				dashed
			/>
		</Svg>
	);
}

/** Reset password: the door is open again and the light is on. */
export function OpenDoorDoodle() {
	return (
		<Svg label="Dibujo de una puerta abierta con luz saliendo, una llave en la cerradura y una planta al lado">
			<ellipse cx="240" cy="340" rx="200" ry="14" fill={soft} />
			<path d="M176 332 H318 L372 392 H120 Z" fill={soft} />

			<g {...ink}>
				<path
					d="M176 332 V94 Q176 80 190 80 H304 Q318 80 318 94 V332 Z"
					fill={warm}
				/>
				<path d="M318 82 L384 58 V356 L318 332 Z" fill={accent} />
				<circle cx="370" cy="214" r="7" fill={paper} />
				<g transform="rotate(20 372 232)">
					<circle cx="372" cy="240" r="9" fill={paper} />
					<path d="M372 249 V276 M372 268 h8 M372 276 h6" />
				</g>
				<path d="M152 332 H400" />
			</g>

			<Plant x={70} y={286} scale={1.05} />

			<g {...ink} fill={paper}>
				<circle cx="248" cy="166" r="22" />
			</g>
			<Squiggle
				d="M248 128 V114 M248 218 V204 M210 166 H196 M300 166 H286 M222 140 L212 130 M274 140 L284 130 M222 192 L212 202 M274 192 L284 202"
				delay={0.7}
			/>
			<Squiggle
				d="M30 382 C80 352 50 318 100 314 C146 312 136 360 186 348"
				dashed
			/>
		</Svg>
	);
}
