const VIEWER_DEVICE_ID_KEY = 'deskreen-viewer-device-id';

function generateDeviceId(): string {
	try {
		if (
			typeof crypto !== 'undefined' &&
			typeof crypto.randomUUID === 'function'
		) {
			return crypto.randomUUID();
		}
	} catch {
		// fall through to Math.random fallback below
	}
	return `viewer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Stable per-browser viewer ID, persisted in localStorage. The host uses it
 * to recognize trusted devices and auto-allow them on reconnect.
 */
export default function getPersistentViewerDeviceId(): string {
	try {
		const stored = window.localStorage.getItem(VIEWER_DEVICE_ID_KEY);
		if (stored && stored !== '') {
			return stored;
		}
		const fresh = generateDeviceId();
		window.localStorage.setItem(VIEWER_DEVICE_ID_KEY, fresh);
		return fresh;
	} catch {
		// localStorage unavailable (private mode etc.) — fall back to an
		// ephemeral id; the device just won't be re-recognized.
		return generateDeviceId();
	}
}
