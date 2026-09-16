import {
	Display,
	ipcMain,
	BrowserWindow,
	screen,
	clipboard,
	shell,
	app,
	nativeTheme,
} from 'electron';
import i18n from '../configs/i18next.config';
import { ConnectedDevicesService } from '../../features/ConnectedDevicesService';
import SharingSession from '../../features/SharingSessionService/SharingSession';
import RoomIDService from '../../server/RoomIDService';
import { signalingServer } from '../../server';
import { onDeviceConnectedCallback } from '../../server/onDeviceConnectedCallback';
import SharingSessionStatusEnum from '../../features/SharingSessionService/SharingSessionStatusEnum';
import getMyLocalIpV4 from './getMyLocalIpV4';
import isWifiConnected from './isWifiConnected';
import { getDeskreenGlobal } from './getDeskreenGlobal';
import { IpcEvents } from '../../common/IpcEvents.enum';
import { ElectronStoreKeys } from '../../common/ElectronStoreKeys.enum';
import { store } from '../../common/deskreen-electron-store';
import DesktopCapturerSourceType from '../../common/DesktopCapturerSourceType';
import isLinuxWaylandSession from '../utils/isLinuxWaylandSession';
import { checkScreenRecordingPermission } from './checkScreenRecordingPermission';
import startSharingOnWaitingSession from './startSharingOnWaitingForConnectionSharingSession';
import {
	getTrustedDeviceIds,
	trustDeviceId,
	untrustDeviceId,
} from './trustedDevices';
import { refreshDisplaySleepBlocker } from './displaySleepBlocker';
import getMacForIp, { listLanInterfaces } from './networkDevices';
import {
	getDeviceAliasOverrides,
	setDeviceAliasOverride,
} from './deviceAliases';

export const initIpcMainHandlers = (mainWindow: BrowserWindow): void => {
	const persistedTheme = store.has(ElectronStoreKeys.Theme)
		? (store.get(ElectronStoreKeys.Theme) as 'system' | 'light' | 'dark')
		: 'system';
	nativeTheme.themeSource = persistedTheme;

	// Single source of truth for what the host UI is actually rendering:
	// the Color Theme setting (via nativeTheme), in every UI style.
	const getEffectiveDarkMode = (): boolean => {
		return nativeTheme.shouldUseDarkColors;
	};

	const getUiStyle = (): string => {
		return store.has(ElectronStoreKeys.UIStyle)
			? String(store.get(ElectronStoreKeys.UIStyle))
			: 'legacy';
	};

	const notifySharingSessionsOfAppTheme = (): void => {
		const isDarkMode = getEffectiveDarkMode();
		const uiStyle = getUiStyle();
		getDeskreenGlobal().sharingSessionService.sharingSessions.forEach(
			(sharingSession) => {
				sharingSession?.appThemeChanged(isDarkMode, uiStyle);
			},
		);
	};

	nativeTheme.on('updated', () => {
		if (mainWindow === null || mainWindow.isDestroyed()) return;
		mainWindow.webContents.send(IpcEvents.ThemeUpdated, {
			themeSource: nativeTheme.themeSource,
			shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
		});
		notifySharingSessionsOfAppTheme();
	});

	ipcMain.on('client-changed-language', async (_, newLangCode) => {
		i18n.changeLanguage(newLangCode);
		if (store.has(ElectronStoreKeys.AppLanguage)) {
			if (store.get(ElectronStoreKeys.AppLanguage) === newLangCode) {
				return;
			}
			store.delete(ElectronStoreKeys.AppLanguage);
		}
		store.set(ElectronStoreKeys.AppLanguage, newLangCode);
	});

	ipcMain.handle('get-signaling-server-port', () => {
		if (mainWindow === null) return;
		mainWindow.webContents.send('sending-port-from-main', signalingServer.port);
	});

	ipcMain.handle('get-all-displays', () => {
		return screen.getAllDisplays();
	});

	ipcMain.handle('get-display-size-by-display-id', (_, displayID: string) => {
		const display = screen.getAllDisplays().find((d: Display) => {
			return `${d.id}` === displayID;
		});

		if (display) {
			return display.size;
		}
		return undefined;
	});

	ipcMain.handle(IpcEvents.GetIsLinuxWaylandSession, () => {
		return isLinuxWaylandSession;
	});

	ipcMain.handle(
		IpcEvents.RequestDesktopCapturerPortalSource,
		async (_, { mode }: { mode: 'screen' | 'window' }) => {
			const types =
				mode === 'window'
					? [DesktopCapturerSourceType.WINDOW]
					: [DesktopCapturerSourceType.SCREEN];

			if (!isLinuxWaylandSession) {
				await getDeskreenGlobal().desktopCapturerSourcesService.refreshDesktopCapturerSources();
				if (mode === 'window') {
					const sources =
						getDeskreenGlobal().desktopCapturerSourcesService.getAppWindowSources();
					return sources[0]?.id ?? null;
				}
				const sources =
					getDeskreenGlobal().desktopCapturerSourcesService.getScreenSources();
				return sources[0]?.id ?? null;
			}

			const source =
				await getDeskreenGlobal().desktopCapturerSourcesService.requestPortalSource(
					types,
				);
			return source?.id ?? null;
		},
	);

	ipcMain.handle('main-window-onbeforeunload', () => {
		const deskreenGlobal = getDeskreenGlobal();
		deskreenGlobal.connectedDevicesService = new ConnectedDevicesService();
		deskreenGlobal.roomIDService = new RoomIDService();
		deskreenGlobal.sharingSessionService.sharingSessions.forEach(
			(sharingSession: SharingSession) => {
				sharingSession.denyConnectionForPartner();
				sharingSession.destroy();
			},
		);

		deskreenGlobal.rendererWebrtcHelpersService.helpers.forEach(
			(helperWindow) => {
				helperWindow.close();
			},
		);

		deskreenGlobal.sharingSessionService.waitingForConnectionSharingSession =
			null;
		deskreenGlobal.rendererWebrtcHelpersService.helpers.clear();
		deskreenGlobal.sharingSessionService.sharingSessions.clear();
	});

	ipcMain.handle('get-latest-version', () => {
		return getDeskreenGlobal().latestAppVersion;
	});

	ipcMain.handle('get-current-version', () => {
		return getDeskreenGlobal().currentAppVersion;
	});

	ipcMain.handle('get-local-lan-ip', async () => {
		const deskreenGlobal = getDeskreenGlobal();
		const storedInterfaceIP = store.get(ElectronStoreKeys.NetworkInterfaceIP);
		if (storedInterfaceIP) {
			return storedInterfaceIP;
		}
		if (deskreenGlobal.cliLocalIp) {
			return deskreenGlobal.cliLocalIp;
		}
		const ip = getMyLocalIpV4();
		return ip;
	});

	ipcMain.handle('check-wifi-connection', async () => {
		return isWifiConnected();
	});

	ipcMain.handle(IpcEvents.GetPort, () => {
		return signalingServer.port;
	});

	ipcMain.handle(IpcEvents.GetAppPath, () => {
		const deskreenGlobal = getDeskreenGlobal();
		return deskreenGlobal.appPath;
	});

	ipcMain.handle(IpcEvents.UnmarkRoomIDAsTaken, (_, roomID) => {
		const deskreenGlobal = getDeskreenGlobal();
		deskreenGlobal.roomIDService.unmarkRoomIDAsTaken(roomID);
	});

	// Last screen source the host user picked. Every freshly minted waiting
	// session inherits it, so viewers 2..10 share the same source without
	// the host having to re-pick it for each of them.
	let lastChosenDesktopCapturerSourceID = '';

	async function createWaitingForConnectionSharingSession(
		roomID?: string,
	): Promise<void> {
		try {
			const deskreenGlobal = getDeskreenGlobal();
			if (
				deskreenGlobal.sharingSessionService
					.waitingForConnectionSharingSession !== null
			) {
				return;
			}
			const waitingSession =
				await deskreenGlobal.sharingSessionService.createWaitingForConnectionSharingSession(
					roomID,
				);
			waitingSession.setOnDeviceConnectedCallback(onDeviceConnectedCallback);
			if (lastChosenDesktopCapturerSourceID !== '') {
				waitingSession.setDesktopCapturerSourceID(
					lastChosenDesktopCapturerSourceID,
				);
			}
		} catch (error) {
			console.error('Failed to create waiting sharing session', error);
		}
	}

	ipcMain.handle(
		IpcEvents.CreateWaitingForConnectionSharingSession,
		async (_, roomID?: string) => {
			await createWaitingForConnectionSharingSession(roomID);
		},
	);

	function resetWaitingForConnectionSharingSession(): void {
		const sharingSession =
			getDeskreenGlobal().sharingSessionService
				.waitingForConnectionSharingSession;
		const roomID = sharingSession?.roomID;
		sharingSession?.denyConnectionForPartner();
		sharingSession?.disconnectByHostMachineUser();
		sharingSession?.destroy();
		sharingSession?.setStatus(SharingSessionStatusEnum.NOT_CONNECTED);
		getDeskreenGlobal().sharingSessionService.sharingSessions.delete(
			sharingSession?.id as string,
		);
		if (roomID) {
			getDeskreenGlobal().roomIDService.unmarkRoomIDAsTaken(roomID);
		}
		getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession =
			null;
	}

	ipcMain.handle(IpcEvents.ResetWaitingForConnectionSharingSession, () => {
		resetWaitingForConnectionSharingSession();
	});

	const removeViewerAvailabilityListener =
		getDeskreenGlobal().connectedDevicesService.addAvailabilityListener(
			(state) => {
				const isAvailable = state === 'available';
				const targetWindow = mainWindow?.isDestroyed() ? null : mainWindow;
				if (targetWindow) {
					targetWindow.webContents.send(
						IpcEvents.ViewerConnectionAvailabilityChanged,
						{
							isAvailable,
						},
					);
				}
				if (isAvailable) {
					void createWaitingForConnectionSharingSession();
				}
			},
		);

	mainWindow.on('closed', () => {
		removeViewerAvailabilityListener();
	});

	ipcMain.handle(IpcEvents.SetDeviceConnectedStatus, () => {
		if (
			getDeskreenGlobal().sharingSessionService
				.waitingForConnectionSharingSession !== null
		) {
			const sharingSession =
				getDeskreenGlobal().sharingSessionService
					.waitingForConnectionSharingSession;
			sharingSession?.setStatus(SharingSessionStatusEnum.CONNECTED);
		}
	});

	ipcMain.handle(
		IpcEvents.GetSourceDisplayIDByDesktopCapturerSourceID,
		(_, sourceId) => {
			return getDeskreenGlobal().desktopCapturerSourcesService.getSourceDisplayIDByDisplayCapturerSourceID(
				sourceId,
			);
		},
	);

	ipcMain.handle(
		IpcEvents.DisconnectPeerAndDestroySharingSessionBySessionID,
		(_, sessionId) => {
			const sharingSession =
				getDeskreenGlobal().sharingSessionService.sharingSessions.get(
					sessionId,
				);
			if (sharingSession) {
				getDeskreenGlobal().connectedDevicesService.disconnectDeviceByID(
					sharingSession.deviceID,
				);
			}
			sharingSession?.disconnectByHostMachineUser();
			sharingSession?.destroy();
			getDeskreenGlobal().sharingSessionService.sharingSessions.delete(
				sessionId,
			);
			refreshDisplaySleepBlocker();
		},
	);

	ipcMain.handle(
		IpcEvents.GetDesktopCapturerSourceIdBySharingSessionId,
		(_, sessionId) => {
			return getDeskreenGlobal().sharingSessionService.sharingSessions.get(
				sessionId,
			)?.desktopCapturerSourceID;
		},
	);

	ipcMain.handle(IpcEvents.GetConnectedDevices, () => {
		return getDeskreenGlobal().connectedDevicesService.getDevices();
	});

	ipcMain.handle(IpcEvents.GetViewerConnectionAvailability, () => {
		return getDeskreenGlobal().connectedDevicesService.isSlotAvailable();
	});

	ipcMain.handle(IpcEvents.DisconnectDeviceById, (_, id) => {
		getDeskreenGlobal().connectedDevicesService.disconnectDeviceByID(id);
		refreshDisplaySleepBlocker();
	});

	ipcMain.handle(IpcEvents.DisconnectAllDevices, () => {
		getDeskreenGlobal().connectedDevicesService.disconnectAllDevices();
		refreshDisplaySleepBlocker();
	});

	ipcMain.handle(IpcEvents.AppLanguageChanged, (_, newLang) => {
		if (store.has(ElectronStoreKeys.AppLanguage)) {
			store.delete(ElectronStoreKeys.AppLanguage);
		}
		store.set(ElectronStoreKeys.AppLanguage, newLang);
		getDeskreenGlobal().sharingSessionService.sharingSessions.forEach(
			(sharingSession) => {
				sharingSession?.appLanguageChanged();
			},
		);
		i18n.changeLanguage(newLang);
	});

	ipcMain.handle(IpcEvents.GetDesktopCapturerServiceSourcesMap, () => {
		const map =
			getDeskreenGlobal().desktopCapturerSourcesService.getSourcesMap();
		const res = {};

		for (const key of map.keys()) {
			const source = map.get(key);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			res[key] = {
				source: {
					thumbnail: source?.source.thumbnail?.toDataURL(),
					appIcon: source?.source.appIcon?.toDataURL(),
					name: source?.source.name,
				},
			};
		}
		return res;
	});

	ipcMain.handle(
		IpcEvents.GetDesktopCapturerServiceSourcesByIds,
		(_, ids: string[]) => {
			const map =
				getDeskreenGlobal().desktopCapturerSourcesService.getSourcesMap();
			const res = {};

			ids.forEach((id) => {
				const source = map.get(id);
				if (!source) return;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				res[id] = {
					source: {
						thumbnail: source?.source.thumbnail?.toDataURL(),
						appIcon: source?.source.appIcon?.toDataURL(),
						name: source?.source.name,
					},
				};
			});
			return res;
		},
	);

	ipcMain.handle(
		IpcEvents.GetWaitingForConnectionSharingSessionSourceId,
		() => {
			return getDeskreenGlobal().sharingSessionService
				.waitingForConnectionSharingSession?.desktopCapturerSourceID;
		},
	);

	ipcMain.handle(
		IpcEvents.StartSharingOnWaitingForConnectionSharingSession,
		() => {
			startSharingOnWaitingSession();
		},
	);

	ipcMain.handle(IpcEvents.GetPendingConnectionDevice, () => {
		return getDeskreenGlobal().connectedDevicesService.pendingConnectionDevice;
	});

	ipcMain.handle(IpcEvents.GetTrustedDeviceIds, () => {
		return getTrustedDeviceIds();
	});

	ipcMain.handle(IpcEvents.TrustDeviceById, (_, trustedDeviceId: string) => {
		trustDeviceId(trustedDeviceId);
	});

	ipcMain.handle(
		IpcEvents.UntrustDeviceById,
		(_, trustedDeviceId: string) => {
			untrustDeviceId(trustedDeviceId);
		},
	);

	ipcMain.handle(IpcEvents.GetAutoStartOnLogin, () => {
		return store.get(ElectronStoreKeys.AutoStartOnLogin) === 'true';
	});

	ipcMain.handle(IpcEvents.SetAutoStartOnLogin, (_, enabled: boolean) => {
		store.set(ElectronStoreKeys.AutoStartOnLogin, enabled ? 'true' : 'false');
		app.setLoginItemSettings({ openAtLogin: enabled });
		return enabled;
	});

	ipcMain.handle(IpcEvents.GetPreventAccidentalQuit, () => {
		return (
			store.get(ElectronStoreKeys.PreventAccidentalQuit) !== 'false'
		);
	});

	ipcMain.handle(
		IpcEvents.SetPreventAccidentalQuit,
		(_, enabled: boolean) => {
			store.set(
				ElectronStoreKeys.PreventAccidentalQuit,
				enabled ? 'true' : 'false',
			);
			return enabled;
		},
	);

	ipcMain.handle(IpcEvents.GetCustomServerPort, () => {
		return store.get(ElectronStoreKeys.CustomServerPort) ?? '';
	});

	ipcMain.handle(IpcEvents.SetCustomServerPort, (_, port: string) => {
		const trimmed = String(port ?? '').trim();
		if (trimmed === '') {
			store.delete(ElectronStoreKeys.CustomServerPort);
			return '';
		}
		const parsed = Number.parseInt(trimmed, 10);
		if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
			throw new Error('Port must be an integer between 1 and 65535');
		}
		store.set(ElectronStoreKeys.CustomServerPort, String(parsed));
		return String(parsed);
	});

	ipcMain.handle(IpcEvents.GetNetworkInterfaces, () => {
		return listLanInterfaces();
	});

	ipcMain.handle(IpcEvents.GetNetworkInterfaceIP, () => {
		return store.get(ElectronStoreKeys.NetworkInterfaceIP) ?? '';
	});

	ipcMain.handle(IpcEvents.SetNetworkInterfaceIP, (_, ip: string) => {
		const value = String(ip ?? '');
		if (value === '') {
			store.delete(ElectronStoreKeys.NetworkInterfaceIP);
		} else {
			store.set(ElectronStoreKeys.NetworkInterfaceIP, value);
		}
		return value;
	});

	ipcMain.handle(IpcEvents.GetDeviceMacByIp, async (_, ip: string) => {
		return getMacForIp(String(ip ?? ''));
	});

	ipcMain.handle(IpcEvents.GetCursorScreenPoint, () => {
		const point = screen.getCursorScreenPoint();
		const display = screen.getDisplayNearestPoint(point);
		const { x, y, width, height } = display.bounds;
		if (width <= 0 || height <= 0) return null;
		return {
			x: Math.min(1, Math.max(0, (point.x - x) / width)),
			y: Math.min(1, Math.max(0, (point.y - y) / height)),
		};
	});

	ipcMain.handle(
		IpcEvents.SetDesktopCapturerSourceIdBySharingSessionId,
		(_, sessionId: string, sourceId: string) => {
			getDeskreenGlobal().sharingSessionService.sharingSessions
				.get(String(sessionId))
				?.setDesktopCapturerSourceID(String(sourceId));
		},
	);

	ipcMain.handle(IpcEvents.GetDeviceAliasOverrides, () => {
		return getDeviceAliasOverrides();
	});

	ipcMain.handle(
		IpcEvents.SetDeviceAliasOverride,
		(_, trustedDeviceId: string, alias: string) => {
			setDeviceAliasOverride(
				String(trustedDeviceId ?? ''),
				String(alias ?? ''),
			);
		},
	);

	ipcMain.handle(IpcEvents.GetWaitingForConnectionSharingSessionRoomId, () => {
		if (
			getDeskreenGlobal().sharingSessionService
				.waitingForConnectionSharingSession === null
		) {
			return undefined;
		}
		return getDeskreenGlobal().sharingSessionService
			.waitingForConnectionSharingSession?.roomID;
	});

	ipcMain.handle(
		IpcEvents.GetDesktopSharingSourceIds,
		async (_, { isEntireScreenToShareChosen }) => {
			if (isLinuxWaylandSession) {
				return [];
			}
			// ensure sources are up to date at request time
			await getDeskreenGlobal().desktopCapturerSourcesService.refreshDesktopCapturerSources();

			if (isEntireScreenToShareChosen === true) {
				return getDeskreenGlobal()
					.desktopCapturerSourcesService.getScreenSources()
					.map((source) => source.id);
			}
			return getDeskreenGlobal()
				.desktopCapturerSourcesService.getAppWindowSources()
				.map((source) => source.id);
		},
	);

	ipcMain.handle(IpcEvents.SetDesktopCapturerSourceId, (_, id) => {
		lastChosenDesktopCapturerSourceID = id;
		getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession?.setDesktopCapturerSourceID(
			id,
		);
	});

	ipcMain.handle(IpcEvents.GetIsFirstTimeAppStart, () => {
		if (store.has(ElectronStoreKeys.IsNotFirstTimeAppStart)) {
			return false;
		}
		return true;
	});

	ipcMain.handle(IpcEvents.SetAppStartedOnce, () => {
		if (store.has(ElectronStoreKeys.IsNotFirstTimeAppStart)) {
			store.delete(ElectronStoreKeys.IsNotFirstTimeAppStart);
		}
		store.set(ElectronStoreKeys.IsNotFirstTimeAppStart, 'true');
	});

	ipcMain.handle(IpcEvents.GetAppLanguage, () => {
		if (store.has(ElectronStoreKeys.AppLanguage)) {
			return store.get(ElectronStoreKeys.AppLanguage);
		}
		return 'en';
	});

	ipcMain.handle(IpcEvents.GetUIStyle, () => {
		if (store.has(ElectronStoreKeys.UIStyle)) {
			return store.get(ElectronStoreKeys.UIStyle);
		}
		return 'modern';
	});

	ipcMain.handle(
		IpcEvents.SetUIStyle,
		(_, newUIStyle: 'legacy' | 'modern') => {
			if (store.has(ElectronStoreKeys.UIStyle)) {
				store.delete(ElectronStoreKeys.UIStyle);
			}
			store.set(ElectronStoreKeys.UIStyle, newUIStyle);
			notifySharingSessionsOfAppTheme();
			return newUIStyle;
		},
	);

	ipcMain.handle(IpcEvents.GetThemeSource, () => {
		return {
			themeSource: nativeTheme.themeSource,
			shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
		};
	});

	ipcMain.handle(
		IpcEvents.SetThemeSource,
		(_, newThemeSource: 'system' | 'light' | 'dark') => {
			nativeTheme.themeSource = newThemeSource;
			if (store.has(ElectronStoreKeys.Theme)) {
				store.delete(ElectronStoreKeys.Theme);
			}
			store.set(ElectronStoreKeys.Theme, newThemeSource);
			notifySharingSessionsOfAppTheme();
			return {
				themeSource: nativeTheme.themeSource,
				shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
			};
		},
	);

	ipcMain.handle(IpcEvents.GetAppTheme, () => {
		return {
			isDarkMode: getEffectiveDarkMode(),
			uiStyle: getUiStyle(),
		};
	});

	ipcMain.handle(IpcEvents.DestroySharingSessionById, (_, id) => {
		if (
			getDeskreenGlobal().sharingSessionService
				.waitingForConnectionSharingSession?.id === id
		) {
			getDeskreenGlobal().sharingSessionService.waitingForConnectionSharingSession =
				null;
		}
		const sharingSession =
			getDeskreenGlobal().sharingSessionService.sharingSessions.get(id);
		sharingSession?.setStatus(SharingSessionStatusEnum.DESTROYED);
		sharingSession?.destroy();
		getDeskreenGlobal().sharingSessionService.sharingSessions.delete(id);
	});

	ipcMain.handle(IpcEvents.OpenExternalLink, (_, url: string) => {
		if (typeof url !== 'string') {
			return;
		}
		shell.openExternal(url);
	});

	ipcMain.handle(IpcEvents.WriteTextToClipboard, (_, text) => {
		clipboard.writeText(text);
	});

	ipcMain.handle(IpcEvents.CheckScreenRecordingPermission, () => {
		return checkScreenRecordingPermission();
	});

	ipcMain.handle(IpcEvents.RelaunchApp, () => {
		app.relaunch();
		app.exit(0);
	});

	void createWaitingForConnectionSharingSession();
};
