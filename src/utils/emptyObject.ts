// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO get this working with 'unknown'
export function emptyObject<T extends Record<string, any>>(obj: T): Record<string, never> {
	for (const key in obj) {
		try {
			// First try deleting
			delete obj[key];
		} catch {
			try {
				obj[key] = undefined as never;
			} catch {
				// Admit defeat
			}
		}
	}
	return obj as Record<string, never>;
}
