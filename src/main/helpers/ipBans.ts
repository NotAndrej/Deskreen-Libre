import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';
import { store } from '../../common/deskreen-electron-store';

/** Normalize an IP for ban-list comparison (strips IPv6-mapped prefix). */
export function normalizeIp(ip: string): string {
	return String(ip ?? '')
		.trim()
		.toLowerCase()
		.replace(/^::ffff:/, '');
}

export function getBannedIPs(): string[] {
	if (!store.has(ElectronStoreKeys.BannedIPs)) {
		return [];
	}
	try {
		const raw = store.get(ElectronStoreKeys.BannedIPs);
		const parsed: unknown = JSON.parse(raw ?? '[]');
		if (Array.isArray(parsed)) {
			return parsed
				.filter((ip): ip is string => typeof ip === 'string')
				.map((ip) => normalizeIp(ip))
				.filter((ip) => ip !== '');
		}
	} catch {
		// corrupted entry — fall through to empty
	}
	return [];
}

export function isIpBanned(ip: string): boolean {
	const normalized = normalizeIp(ip);
	if (!normalized) return false;
	return getBannedIPs().includes(normalized);
}

export function banIp(ip: string): void {
	const normalized = normalizeIp(ip);
	if (!normalized) return;
	const ips = getBannedIPs();
	if (!ips.includes(normalized)) {
		ips.push(normalized);
		store.set(ElectronStoreKeys.BannedIPs, JSON.stringify(ips));
	}
}

export function unbanIp(ip: string): void {
	const normalized = normalizeIp(ip);
	if (!normalized) return;
	store.set(
		ElectronStoreKeys.BannedIPs,
		JSON.stringify(getBannedIPs().filter((entry) => entry !== normalized)),
	);
}
