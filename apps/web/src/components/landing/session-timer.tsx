"use client";

import { useEffect, useState } from "react";

function format(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SessionTimer({ startAt }: { startAt: number }) {
	const [elapsed, setElapsed] = useState(startAt);

	useEffect(() => {
		const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
		return () => window.clearInterval(id);
	}, []);

	return <span className="tabular-nums">{format(elapsed)}</span>;
}
