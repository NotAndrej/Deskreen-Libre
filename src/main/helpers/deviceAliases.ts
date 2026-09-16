import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';
import { store } from '../../common/deskreen-electron-store';

export function getDeviceAliasOverrides(): Record<string, string> {
	if (!store.has(ElectronStoreKeys.DeviceAliasOverrides)) {
		return {};
	}
	try {
		const raw = store.get(ElectronStoreKeys.DeviceAliasOverrides);
		const parsed: unknown = JSON.parse(raw ?? '{}');
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
			const result: Record<string, string> = {};
			for (const [key, value] of Object.entries(
				parsed as Record<string, unknown>,
			)) {
				if (typeof value === 'string' && value !== '') {
					result[key] = value.slice(0, 64);
				}
			}
			return result;
		}
	} catch {
		// corrupted entry — fall through to empty
	}
	return {};
}

export function setDeviceAliasOverride(
	trustedDeviceId: string,
	alias: string,
): void {
	if (!trustedDeviceId) return;
	const overrides = getDeviceAliasOverrides();
	const trimmed = alias.trim().slice(0, 64);
	if (trimmed === '') {
		delete overrides[trustedDeviceId];
	} else {
		overrides[trustedDeviceId] = trimmed;
	}
	store.set(ElectronStoreKeys.DeviceAliasOverrides, JSON.stringify(overrides));
}

export function resolveDeviceAlias(
	device: { trustedDeviceId: string; alias: string },
	overrides?: Record<string, string>,
): string {
	const map = overrides ?? getDeviceAliasOverrides();
	if (
		device.trustedDeviceId !== '' &&
		map[device.trustedDeviceId] !== undefined
	) {
		return map[device.trustedDeviceId];
	}
	return device.alias;
}
