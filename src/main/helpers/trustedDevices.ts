import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';
import { store } from '../../common/deskreen-electron-store';

export function getTrustedDeviceIds(): string[] {
	if (!store.has(ElectronStoreKeys.TrustedDeviceIds)) {
		return [];
	}
	try {
		const raw = store.get(ElectronStoreKeys.TrustedDeviceIds);
		const ids: unknown = JSON.parse(raw ?? '[]');
		return Array.isArray(ids)
			? ids.filter((id): id is string => typeof id === 'string')
			: [];
	} catch {
		return [];
	}
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
		store.set(ElectronStoreKeys.TrustedDeviceIds, JSON.stringify(ids));
	}
}

export function untrustDeviceId(trustedDeviceId: string): void {
	if (!trustedDeviceId) return;
	store.set(
		ElectronStoreKeys.TrustedDeviceIds,
		JSON.stringify(
			getTrustedDeviceIds().filter((id) => id !== trustedDeviceId),
		),
	);
}
