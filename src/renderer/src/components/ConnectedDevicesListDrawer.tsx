import { useEffect, useState, useCallback } from 'react';
import {
	Button,
	Text,
	Position,
	Drawer,
	Card,
	Alert,
	H4,
	DrawerSize,
	EditableText,
} from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { makeStyles } from 'tss-react/mui';
import CloseOverlayButton from './CloseOverlayButton';
import DeviceInfoCallout from './DeviceInfoCallout';
import SharingSourcePreviewCard from './SharingSourcePreviewCard';
import { Device } from '../../../common/Device';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import isProduction from '../../../common/isProduction';
import { useTranslation } from 'react-i18next';

type DeviceWithDesktopCapturerSourceId = Device & {
	desktopCapturerSourceId: string;
};

interface ConnectedDevicesListDrawerProps {
	isOpen: boolean;
	handleToggle: () => void;
	handleReset: () => void;
}

const useStyles = makeStyles()(() => ({
	drawerRoot: { overflowY: 'scroll', overflowX: 'hidden' },
	drawerInnerTopPanel: { padding: '20px 10px 0px 30px' },
	connectedDevicesRoot: { padding: '10px 20px' },
	topHeader: {
		marginRight: '20px',
		fontSize: '20px',
		fontWeight: 900,
	},
	zoomFullWidth: {
		width: '100%',
	},
}));

export default function ConnectedDevicesListDrawer(
	props: ConnectedDevicesListDrawerProps,
) {
	const { classes } = useStyles();
	const { t } = useTranslation();

	const [isAlertDisconectAllOpen, setIsAlertDisconectAllOpen] = useState(false);
	const [connectedDevices, setConnectedDevices] = useState<
		DeviceWithDesktopCapturerSourceId[]
	>([]);
	const [devicesDisplayed, setDevicesDisplayed] = useState(new Map());
	const [trustedDeviceIds, setTrustedDeviceIds] = useState<string[]>([]);
	const [aliasOverrides, setAliasOverrides] = useState<Record<string, string>>(
		{},
	);
	const [deviceMacs, setDeviceMacs] = useState<Record<string, string>>({});

	const refreshDeviceMacs = useCallback(
		(devices: DeviceWithDesktopCapturerSourceId[]) => {
			for (const device of devices) {
				if (!device.deviceIP || deviceMacs[device.id] !== undefined) continue;
				window.electron.ipcRenderer
					.invoke(IpcEvents.GetDeviceMacByIp, device.deviceIP)
					.then((mac: string) => {
						if (mac) {
							setDeviceMacs((prev) =>
								prev[device.id] !== undefined
									? prev
									: { ...prev, [device.id]: mac },
							);
						}
					})
					.catch((e) => console.error(e));
			}
		},
		[deviceMacs],
	);

	useEffect(() => {
		function getConnectedDevicesCallback() {
			window.electron.ipcRenderer
				.invoke(IpcEvents.GetConnectedDevices)
				.then(async (devices: Device[]) => {
					const devicesWithSourceIds: DeviceWithDesktopCapturerSourceId[] = [];

					for await (const device of devices) {
						const sharingSourceId = await window.electron.ipcRenderer.invoke(
							IpcEvents.GetDesktopCapturerSourceIdBySharingSessionId,
							device.sharingSessionID,
						);
						devicesWithSourceIds.push({
							...device,
							desktopCapturerSourceId: sharingSourceId,
						});
					}
					setConnectedDevices(devicesWithSourceIds);
					refreshDeviceMacs(devicesWithSourceIds);

					const map = new Map();
					devicesWithSourceIds.forEach((el) => {
						map.set(el.id, true);
					});
					setDevicesDisplayed(map);
				})

				.catch((e) => console.error(e));
		}

		getConnectedDevicesCallback();

		window.electron.ipcRenderer
			.invoke(IpcEvents.GetTrustedDeviceIds)
			.then((ids: string[]) => {
				setTrustedDeviceIds(ids ?? []);
			})
			.catch((e) => console.error(e));

		window.electron.ipcRenderer
			.invoke(IpcEvents.GetDeviceAliasOverrides)
			.then((overrides: Record<string, string>) => {
				setAliasOverrides(overrides ?? {});
			})
			.catch((e) => console.error(e));

		const connectedDevicesInterval = setInterval(
			getConnectedDevicesCallback,
			4000,
		);

		return () => {
			clearInterval(connectedDevicesInterval);
		};
	}, []);

	const handleDisconnectOneDevice = useCallback(
		async (id: string) => {
			const device = connectedDevices.find((d: Device) => d.id === id);
			if (!device) return;
			await window.electron.ipcRenderer.invoke(
				IpcEvents.DisconnectPeerAndDestroySharingSessionBySessionID,
				device.sharingSessionID,
			);
			await window.electron.ipcRenderer.invoke(
				IpcEvents.DisconnectDeviceById,
				device.id,
			);
			setConnectedDevices(connectedDevices.filter((d: Device) => d.id !== id));
		},
		[connectedDevices, setConnectedDevices],
	);

	const handleSaveAliasOverride = useCallback(
		async (trustedDeviceId: string, alias: string) => {
			if (!trustedDeviceId) return;
			await window.electron.ipcRenderer.invoke(
				IpcEvents.SetDeviceAliasOverride,
				trustedDeviceId,
				alias,
			);
			const trimmed = alias.trim().slice(0, 64);
			setAliasOverrides((prev) => {
				const next = { ...prev };
				if (trimmed === '') {
					delete next[trustedDeviceId];
				} else {
					next[trustedDeviceId] = trimmed;
				}
				return next;
			});
		},
		[],
	);

	const resolveAlias = useCallback(
		(device: DeviceWithDesktopCapturerSourceId): string => {
			if (
				device.trustedDeviceId !== '' &&
				aliasOverrides[device.trustedDeviceId] !== undefined
			) {
				return aliasOverrides[device.trustedDeviceId];
			}
			return device.alias;
		},
		[aliasOverrides],
	);

	const handleToggleTrustDevice = useCallback(
		async (trustedDeviceId: string, isTrusted: boolean) => {
			if (!trustedDeviceId) return;
			await window.electron.ipcRenderer.invoke(
				isTrusted ? IpcEvents.UntrustDeviceById : IpcEvents.TrustDeviceById,
				trustedDeviceId,
			);
			setTrustedDeviceIds((prev) =>
				isTrusted
					? prev.filter((id) => id !== trustedDeviceId)
					: [...prev, trustedDeviceId],
			);
		},
		[],
	);

	const handleDisconnectAll = useCallback(() => {
		connectedDevices.forEach((device: Device) => {
			window.electron.ipcRenderer.invoke(
				IpcEvents.DisconnectPeerAndDestroySharingSessionBySessionID,
				device.sharingSessionID,
			);
		});
		window.electron.ipcRenderer.invoke(IpcEvents.DisconnectAllDevices);
	}, [connectedDevices]);

	const hideOneDeviceInDevicesDisplayed = useCallback(
		(id) => {
			const newDevicesDisplayed = new Map(devicesDisplayed);
			newDevicesDisplayed.set(id, false);
			setDevicesDisplayed(newDevicesDisplayed);
			newDevicesDisplayed.delete(id);
			setDevicesDisplayed(newDevicesDisplayed);
			setConnectedDevices(
				connectedDevices.filter((device) => device.id !== id),
			);
		},
		[
			connectedDevices,
			setConnectedDevices,
			devicesDisplayed,
			setDevicesDisplayed,
		],
	);

	const hideAllDevicesInDevicesDisplayed = useCallback(() => {
		const newDevicesDisplayed = new Map(devicesDisplayed);
		[...newDevicesDisplayed.keys()].forEach((key) => {
			newDevicesDisplayed.set(key, false);
		});
		setDevicesDisplayed(newDevicesDisplayed);
	}, [devicesDisplayed, setDevicesDisplayed]);

	const handleDisconnectAndHideOneDevice = useCallback(
		(id) => {
			hideOneDeviceInDevicesDisplayed(id);
			handleDisconnectOneDevice(id);
		},
		[handleDisconnectOneDevice, hideOneDeviceInDevicesDisplayed],
	);

	const handleDisconnectAndHideAllDevices = useCallback(() => {
		hideAllDevicesInDevicesDisplayed();
		setTimeout(
			() => {
				handleDisconnectAll();
				props.handleToggle();
				props.handleReset();
			},
			isProduction() ? 1000 : 0,
		);
	}, [handleDisconnectAll, hideAllDevicesInDevicesDisplayed, props]);

	const disconnectAllCancelButtonText = t('no-cancel');
	const disconnectAllConfirmButtonText = t('yes-disconnect-all');

	return (
		<>
			<Drawer
				className={classes.drawerRoot}
				position={Position.BOTTOM}
				size={DrawerSize.LARGE}
				isOpen={props.isOpen}
				onClose={props.handleToggle}
				transitionDuration={0}
			>
				<Row between="xs" middle="xs" className={classes.drawerInnerTopPanel}>
					<Col xs={11}>
						<Row middle="xs">
							<div className={classes.topHeader}>
								<Text className="bp3-text-muted">{t('connected-devices')}</Text>
							</div>
							<Button
								intent="danger"
								disabled={connectedDevices.length === 0}
								onClick={() => {
									setIsAlertDisconectAllOpen(true);
								}}
								icon="disable"
								style={{
									borderRadius: '100px',
								}}
							>
								{t('disconnect-all-devices')}
							</Button>
						</Row>
					</Col>
					<Col xs={1}>
						<CloseOverlayButton onClick={props.handleToggle} isDefaultStyles />
					</Col>
				</Row>
				<Row className={classes.connectedDevicesRoot}>
					<Col xs={12}>
						<div className={classes.zoomFullWidth}>
							{connectedDevices.map((device) => {
								return (
									<div key={device.id}>
										<Card className="connected-device-card">
											<Row middle="xs">
												<Col xs={6}>
													<DeviceInfoCallout
														deviceType={device.deviceType}
														deviceOS={device.deviceOS}
														deviceIP={device.deviceIP}
														deviceBrowser={device.deviceBrowser}
														deviceRoomId={device.deviceRoomId}
														deviceAlias={resolveAlias(device)}
														deviceMAC={deviceMacs[device.id] ?? ''}
													/>
													{device.trustedDeviceId !== '' && (
														<div
															style={{
																marginTop: '8px',
																display: 'flex',
																alignItems: 'center',
																gap: '8px',
															}}
														>
															<Text className="bp3-text-muted">
																{t('device-alias')}:
															</Text>
															<EditableText
																placeholder={device.alias}
																value={
																	aliasOverrides[device.trustedDeviceId] ??
																	''
																}
																onConfirm={(value) => {
																	void handleSaveAliasOverride(
																		device.trustedDeviceId,
																		value,
																	);
																}}
															/>
														</div>
													)}
												</Col>
												<Col xs={6}>
													<SharingSourcePreviewCard
														sharingSourceID={device.desktopCapturerSourceId}
													/>
												</Col>
											</Row>
											<Row center="xs">
												{device.trustedDeviceId !== '' &&
													(trustedDeviceIds.includes(
														device.trustedDeviceId,
													) ? (
														<Button
															intent="none"
															onClick={(): void => {
																void handleToggleTrustDevice(
																	device.trustedDeviceId,
																	true,
																);
															}}
															icon="delete"
															style={{
																borderRadius: '100px',
																marginRight: '8px',
															}}
														>
															{t('untrust-device')}
														</Button>
													) : (
														<Button
															intent="success"
															onClick={(): void => {
																void handleToggleTrustDevice(
																	device.trustedDeviceId,
																	false,
																);
															}}
															icon="shield"
															style={{
																borderRadius: '100px',
																marginRight: '8px',
															}}
														>
															{t('trust-device')}
														</Button>
													))}
												<Button
													id={`disconnect-device-${device.deviceIP}`}
													intent="danger"
													onClick={(): void => {
														handleDisconnectAndHideOneDevice(device.id);
													}}
													icon="disable"
													style={{
														borderRadius: '100px',
													}}
												>
													{t('disconnect')}
												</Button>
											</Row>
										</Card>
									</div>
								);
							})}
						</div>
					</Col>
				</Row>
			</Drawer>
			<Alert
				isOpen={isAlertDisconectAllOpen}
				onClose={() => {
					setIsAlertDisconectAllOpen(false);
				}}
				icon="warning-sign"
				cancelButtonText={disconnectAllCancelButtonText}
				confirmButtonText={disconnectAllConfirmButtonText}
				intent="danger"
				canEscapeKeyCancel
				canOutsideClickCancel
				onCancel={() => {
					setIsAlertDisconectAllOpen(false);
				}}
				onConfirm={handleDisconnectAndHideAllDevices}
				transitionDuration={0}
			>
				<H4>
					{t(
						'are-you-sure-you-want-to-disconnect-all-connected-viewing-devices',
					)}
				</H4>
				<Text>{t('this-step-can-not-be-undone')}</Text>
				<Text>{t('you-will-have-to-connect-all-devices-manually-again')}</Text>
			</Alert>
		</>
	);
}
