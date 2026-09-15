import SharingSessionStatusEnum from '../../features/SharingSessionService/SharingSessionStatusEnum';
import { getDeskreenGlobal } from './getDeskreenGlobal';

/**
 * Runs the allow-chain for the pending device: occupies a viewer slot with
 * it and hands the waiting session over to WebRTC sharing. Used both by the
 * manual ALLOW click (via IPC) and by trusted-device auto-allow.
 */
export default function startSharingOnWaitingForConnectionSharingSession(): void {
	const deskreenGlobal = getDeskreenGlobal();
	const { connectedDevicesService, sharingSessionService, roomIDService } =
		deskreenGlobal;
	if (!connectedDevicesService.isSlotAvailable()) {
		const waitingSession =
			sharingSessionService.waitingForConnectionSharingSession;
		waitingSession?.denyConnectionForPartner();
		waitingSession?.setStatus(SharingSessionStatusEnum.NOT_CONNECTED);
		sharingSessionService.waitingForConnectionSharingSession = null;
		connectedDevicesService.resetPendingConnectionDevice();
		return;
	}

	const pendingDevice = connectedDevicesService.pendingConnectionDevice;
	if (!pendingDevice.id) {
		return;
	}

	const sharingSession =
		sharingSessionService.waitingForConnectionSharingSession;
	if (sharingSession !== null) {
		roomIDService.unmarkRoomIDAsTaken(sharingSession.roomID);
	}

	// Clear the consumed session BEFORE occupying a slot: addDevice
	// notifies the availability listener, which mints the next waiting
	// session — but it bails out while one is still present.
	sharingSessionService.waitingForConnectionSharingSession = null;

	try {
		connectedDevicesService.addDevice(pendingDevice);
	} catch (error) {
		console.error('failed to add viewer device', error);
		if (sharingSession !== null) {
			sharingSession.setStatus(SharingSessionStatusEnum.ERROR);
			sharingSession.denyConnectionForPartner();
		}
		connectedDevicesService.resetPendingConnectionDevice();
		return;
	}

	if (sharingSession !== null) {
		sharingSession.callPeer();
		sharingSession.setStatus(SharingSessionStatusEnum.SHARING);
	}

	connectedDevicesService.resetPendingConnectionDevice();
}
