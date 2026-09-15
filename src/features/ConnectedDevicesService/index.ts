import { Device } from '../../common/Device';

export const nullDevice: Device = {
	id: '',
	sharingSessionID: '',
	deviceOS: '',
	deviceType: '',
	deviceIP: '',
	deviceBrowser: '',
	deviceScreenWidth: -1,
	deviceScreenHeight: -1,
	deviceRoomId: '',
};

export const MAX_CONNECTED_VIEWERS = 10;

const SLOTS_VIOLATION_MESSAGE = `viewer slots are already fully occupied (${MAX_CONNECTED_VIEWERS}/${MAX_CONNECTED_VIEWERS})`;

type ViewerConnectionAvailability = 'available' | 'occupied';

class ViewerSlots {
	private devices = new Map<string, Readonly<Device>>();

	occupy(device: Device): void {
		if (this.devices.has(device.id)) {
			this.devices.set(device.id, Object.freeze({ ...device }));
			return;
		}
		if (this.devices.size >= MAX_CONNECTED_VIEWERS) {
			throw new Error(SLOTS_VIOLATION_MESSAGE);
		}
		this.devices.set(device.id, Object.freeze({ ...device }));
	}

	releaseById(deviceIDToRemove: string): boolean {
		return this.devices.delete(deviceIDToRemove);
	}

	release(): void {
		this.devices.clear();
	}

	isAvailable(): boolean {
		return this.devices.size < MAX_CONNECTED_VIEWERS;
	}

	snapshot(): Device[] {
		return [...this.devices.values()].map((device) => ({ ...device }));
	}

	isOccupiedBy(deviceID: string): boolean {
		return this.devices.has(deviceID);
	}
}

export class ConnectedDevicesService {
	private readonly slots = new ViewerSlots();

	pendingConnectionDevice: Device = nullDevice;

	private readonly availabilityListeners = new Set<
		(state: ViewerConnectionAvailability) => void
	>();

	resetPendingConnectionDevice(): void {
		this.pendingConnectionDevice = nullDevice;
	}

	getDevices(): Device[] {
		return this.slots.snapshot();
	}

	isSlotAvailable(): boolean {
		return this.slots.isAvailable();
	}

	addAvailabilityListener(
		listener: (state: ViewerConnectionAvailability) => void,
	): () => void {
		this.availabilityListeners.add(listener);
		listener(this.getAvailabilityState());
		return () => {
			this.availabilityListeners.delete(listener);
		};
	}

	disconnectAllDevices(): void {
		this.slots.release();
		this.notifyAvailabilityListeners();
	}

	disconnectDeviceByID(deviceIDToRemove: string): Promise<undefined> {
		return new Promise<undefined>((resolve) => {
			this.slots.releaseById(deviceIDToRemove);
			this.notifyAvailabilityListeners();
			resolve(undefined);
		});
	}

	addDevice(device: Device): void {
		try {
			this.slots.occupy(device);
		} catch (error) {
			if (error instanceof Error && error.message === SLOTS_VIOLATION_MESSAGE) {
				throw error;
			}
			throw error;
		}
		this.notifyAvailabilityListeners();
	}

	setPendingConnectionDevice(device: Device): void {
		this.pendingConnectionDevice = device;
	}

	private getAvailabilityState(): ViewerConnectionAvailability {
		return this.slots.isAvailable() ? 'available' : 'occupied';
	}

	private notifyAvailabilityListeners(): void {
		const state = this.getAvailabilityState();
		this.availabilityListeners.forEach((listener) => {
			try {
				listener(state);
			} catch (error) {
				console.error('connected devices availability listener failed', error);
			}
		});
	}
}
