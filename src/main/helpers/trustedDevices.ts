import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';
import { store } from '../../common/deskreen-electron-store';

export function getTrustedDeviceIds(): string[] {
	if (!store.has(ElectronStoreKeys.TrustedDeviceIds)) {
		return [];
	}
	const ids = store.get(ElectronStoreKeys.TrustedDeviceIds);
	return Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
}

export function isDeviceTrusted(trustedDeviceId: string): boolean {
	if (!trustedDeviceId) return false;
	return getTrustedDeviceIds().includes(trustedDeviceId);
}

export function trustDeviceId(trustedDeviceId: string): void {
	if (!trustedDeviceId) return;
	const ids = getTrustedDeviceIds();
	if (!ids.includes(trustedDeviceId)) {
		ids.push(trustedDeviceId);
		store.set(ElectronStoreKeys.TrustedDeviceIds, ids);
	}
}

export function untrustDeviceId(trustedDeviceId: string): void {
	if (!trustedDeviceId) return;
	store.set(
		ElectronStoreKeys.TrustedDeviceIds,
		getTrustedDeviceIds().filter((id) => id !== trustedDeviceId),
	);
}
