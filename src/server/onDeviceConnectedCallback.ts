import { IpcEvents } from '../common/IpcEvents.enum';
import { getDeskreenGlobal } from '../main/helpers/getDeskreenGlobal';
import { deskreenApp } from '../main';
import { Device } from '../common/Device';
import SharingSessionStatusEnum from '../features/SharingSessionService/SharingSessionStatusEnum';
import startSharingOnWaitingSession from '../main/helpers/startSharingOnWaitingForConnectionSharingSession';
import { isDeviceTrusted } from '../main/helpers/trustedDevices';

export function onDeviceConnectedCallback(device: Device): void {
	const deskreenGlobal = getDeskreenGlobal();
	const { connectedDevicesService, sharingSessionService } = deskreenGlobal;
	if (!connectedDevicesService.isSlotAvailable()) {
		const waitingSession =
			sharingSessionService.waitingForConnectionSharingSession;
		waitingSession?.denyConnectionForPartner();
		waitingSession?.setStatus(SharingSessionStatusEnum.NOT_CONNECTED);
		sharingSessionService.waitingForConnectionSharingSession = null;
		connectedDevicesService.resetPendingConnectionDevice();
		return;
	}
	connectedDevicesService.setPendingConnectionDevice(device);
	if (isDeviceTrusted(device.trustedDeviceId)) {
		startSharingOnWaitingSession();
		deskreenApp.mainWindow?.webContents.send(
			IpcEvents.TrustedDeviceAutoAllowed,
			device,
		);
		return;
	}
	deskreenApp.mainWindow?.webContents.send(
		IpcEvents.SetPendingConnectionDevice,
		device,
	);
}
