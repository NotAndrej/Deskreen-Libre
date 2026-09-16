import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';
import { store } from '../../common/deskreen-electron-store';

export function getConnectionPassword(): string {
	if (!store.has(ElectronStoreKeys.ConnectionPassword)) {
		return '';
	}
	return store.get(ElectronStoreKeys.ConnectionPassword) ?? '';
}

export function setConnectionPassword(password: string): string {
	const trimmed = String(password ?? '').slice(0, 256);
	if (trimmed === '') {
		store.delete(ElectronStoreKeys.ConnectionPassword);
		return '';
	}
	store.set(ElectronStoreKeys.ConnectionPassword, trimmed);
	return trimmed;
}
