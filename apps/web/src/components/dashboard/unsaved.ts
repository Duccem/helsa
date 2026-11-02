"use client";

import { useEffect } from "react";

/** Warns before closing the tab while a form has unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
	useEffect(() => {
		if (!dirty) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);
}

/** True when it's fine to leave: nothing changed, or the therapist agreed to discard. */
export function confirmDiscard(dirty: boolean) {
	return !dirty || window.confirm("Tienes cambios sin guardar. ¿Descartarlos?");
}
