const VIEWER_PASSWORD_KEY = 'deskreen-viewer-password';

/** Connection password sent in the handshake. Empty when unset. */
export function getViewerPassword(): string {
	try {
		return window.localStorage.getItem(VIEWER_PASSWORD_KEY) ?? '';
	} catch {
		return '';
	}
}

export function setViewerPassword(password: string): void {
	try {
		const trimmed = password.slice(0, 256);
		if (trimmed === '') {
			window.localStorage.removeItem(VIEWER_PASSWORD_KEY);
		} else {
			window.localStorage.setItem(VIEWER_PASSWORD_KEY, trimmed);
		}
	} catch {
		// localStorage unavailable — password just won't persist
	}
}
