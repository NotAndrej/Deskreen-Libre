import { powerSaveBlocker } from 'electron';
import { getDeskreenGlobal } from './getDeskreenGlobal';

let blockerId: number | null = null;

/**
 * Keeps the display awake while at least one viewer is sharing, and lets it
 * sleep again when the last one leaves. Safe to call after any change in
 * connected-device membership.
 */
export function refreshDisplaySleepBlocker(): void {
	const deviceCount =
		getDeskreenGlobal().connectedDevicesService.getDevices().length;
	if (deviceCount > 0) {
		if (blockerId === null || !powerSaveBlocker.isStarted(blockerId)) {
			blockerId = powerSaveBlocker.start('prevent-display-sleep');
		}
		return;
	}
	if (blockerId !== null) {
		try {
			if (powerSaveBlocker.isStarted(blockerId)) {
				powerSaveBlocker.stop(blockerId);
			}
		} catch {
			// already stopped / app shutting down — nothing to do
		}
		blockerId = null;
	}
}
