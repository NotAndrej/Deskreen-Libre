export interface Device {
	id: string;
	sharingSessionID: string;
	deviceOS: string;
	deviceType: string;
	deviceIP: string;
	deviceBrowser: string;
	deviceScreenWidth: number;
	deviceScreenHeight: number;
	deviceRoomId: string;
	/** Stable viewer-generated ID (persisted in viewer localStorage).
	 * Empty for viewers that predate it. Used for trusted-device auto-allow. */
	trustedDeviceId: string;
	/** Viewer-chosen name, empty when unset. */
	alias: string;
	/** Password supplied by the viewer at handshake (compared, never stored). */
	password: string;
}
