const VIEWER_ALIAS_KEY = 'deskreen-viewer-alias';

/** Viewer-chosen device name shown to the host. Empty when unset. */
export function getViewerAlias(): string {
	try {
		return window.localStorage.getItem(VIEWER_ALIAS_KEY) ?? '';
	} catch {
		return '';
	}
}

export function setViewerAlias(alias: string): void {
	try {
		const trimmed = alias.trim().slice(0, 64);
		if (trimmed === '') {
			window.localStorage.removeItem(VIEWER_ALIAS_KEY);
		} else {
			window.localStorage.setItem(VIEWER_ALIAS_KEY, trimmed);
		}
	} catch {
		// localStorage unavailable — alias just won't persist
	}
}
