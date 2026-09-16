import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
	Overlay2,
	Classes,
	H3,
	H4,
	Text,
	Callout,
	Switch,
	NumericInput,
	HTMLSelect,
	Alert,
	Button,
} from '@blueprintjs/core';
import { Row } from 'react-flexbox-grid';
import { makeStyles } from 'tss-react/mui';
import CloseOverlayButton from '../CloseOverlayButton';
import SettingRowLabelAndInput from './SettingRowLabelAndInput';
import LanguageSelector from '../LanguageSelector';
import ToggleThemeBtnGroup from '../ToggleThemeBtnGroup';
import ToggleUIStyleBtnGroup from '../ToggleUIStyleBtnGroup';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import { BRAND_OPTIONS } from '../../../../common/brandNames';
import { SettingsContext } from '../../contexts/SettingsContext';
import { useTranslation } from 'react-i18next';

interface SettingsOverlayProps {
	isSettingsOpen: boolean;
	handleClose: () => void;
}

type SettingsOverlayClassKey =
	| 'overlayInnerRoot'
	| 'overlayInsideFade'
	| 'absoluteCloseButton'
	| 'updateCalloutWrapper'
	| 'updateCallout';

type SettingsOverlayClassMap = Record<SettingsOverlayClassKey, string>;

const useStyles = makeStyles()(() => ({
	overlayInnerRoot: { width: '100%', height: '100%' },
	overlayInsideFade: {
		padding: '20px',
		height: '100%',
		boxSizing: 'border-box',
		overflowY: 'auto',
	},
	absoluteCloseButton: { position: 'absolute', left: 'calc(100% - 65px)' },
	updateCalloutWrapper: {
		display: 'flex',
		justifyContent: 'center',
		marginBottom: '16px',
		width: '100%',
	},
	updateCallout: {
		cursor: 'pointer',
		boxShadow: 'none',
		display: 'inline-flex',
		flexDirection: 'column',
		gap: '4px',
		width: 'auto',
		maxWidth: '420px',
		borderRadius: '8px',
	},
}));

export default function SettingsOverlay(
	props: SettingsOverlayProps,
): React.ReactElement {
	const { handleClose, isSettingsOpen } = props;
	const [latestVersion, setLatestVersion] = useState('');
	const [currentVersion, setCurrentVersion] = useState('');
	const [autoStartOnLogin, setAutoStartOnLogin] = useState(false);
	const [preventAccidentalQuit, setPreventAccidentalQuit] = useState(true);
	const [customServerPort, setCustomServerPort] = useState('');
	const [networkInterfaces, setNetworkInterfaces] = useState<
		{ name: string; address: string }[]
	>([]);
	const [networkInterfaceIP, setNetworkInterfaceIP] = useState('');
	const { brandName, setBrandNameHook } = useContext(SettingsContext);
	const [isFactoryResetAlertOpen, setIsFactoryResetAlertOpen] =
		useState(false);

	const { t } = useTranslation();

	const { classes } = useStyles() as { classes: SettingsOverlayClassMap };

	const handleOpenDownload = useCallback((): void => {
		void window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://github.com/NotAndrej/Deskreen-Libre/releases',
		);
	}, []);

	const handleUpdateCalloutKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>): void => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				handleOpenDownload();
			}
		},
		[handleOpenDownload],
	);

	useEffect(() => {
		return () => {
			window.electron.ipcRenderer.removeListener(
				'settings-overlay-close',
				handleClose,
			);
		};
	}, [handleClose]);

	useEffect(() => {
		const getLatestVersion = async (): Promise<void> => {
			const gotLatestVersion =
				await window.electron.ipcRenderer.invoke('get-latest-version');
			if (gotLatestVersion !== '') {
				setLatestVersion(gotLatestVersion);
			}
		};
		getLatestVersion();
		const getCurrentVersion = async (): Promise<void> => {
			const gotCurrentVersion = await window.electron.ipcRenderer.invoke(
				'get-current-version',
			);
			if (gotCurrentVersion !== '') {
				setCurrentVersion(gotCurrentVersion);
			}
		};
		getCurrentVersion();
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetAutoStartOnLogin)
			.then((enabled: boolean) => setAutoStartOnLogin(Boolean(enabled)))
			.catch((error) => console.error(error));
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetPreventAccidentalQuit)
			.then((enabled: boolean) => setPreventAccidentalQuit(Boolean(enabled)))
			.catch((error) => console.error(error));
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetCustomServerPort)
			.then((port: string) => setCustomServerPort(String(port ?? '')))
			.catch((error) => console.error(error));
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetNetworkInterfaces)
			.then((interfaces: { name: string; address: string }[]) =>
				setNetworkInterfaces(interfaces ?? []),
			)
			.catch((error) => console.error(error));
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetNetworkInterfaceIP)
			.then((ip: string) => setNetworkInterfaceIP(String(ip ?? '')))
			.catch((error) => console.error(error));
	}, []);

	const handleAutoStartChange = useCallback(
		(event: React.FormEvent<HTMLInputElement>) => {
			const enabled = event.currentTarget.checked;
			setAutoStartOnLogin(enabled);
			window.electron.ipcRenderer
				.invoke(IpcEvents.SetAutoStartOnLogin, enabled)
				.catch((error) => console.error(error));
		},
		[],
	);

	const handlePreventQuitChange = useCallback(
		(event: React.FormEvent<HTMLInputElement>) => {
			const enabled = event.currentTarget.checked;
			setPreventAccidentalQuit(enabled);
			window.electron.ipcRenderer
				.invoke(IpcEvents.SetPreventAccidentalQuit, enabled)
				.catch((error) => console.error(error));
		},
		[],
	);

	const handlePortBlur = useCallback(() => {
		window.electron.ipcRenderer
			.invoke(IpcEvents.SetCustomServerPort, customServerPort.trim())
			.then((saved: string) => setCustomServerPort(String(saved ?? '')))
			.catch((error) => console.error(error));
	}, [customServerPort]);

	const handleInterfaceChange = useCallback(
		(event: React.ChangeEvent<HTMLSelectElement>) => {
			const ip = event.currentTarget.value;
			setNetworkInterfaceIP(ip);
			window.electron.ipcRenderer
				.invoke(IpcEvents.SetNetworkInterfaceIP, ip)
				.catch((error) => console.error(error));
		},
		[],
	);

	const handleBrandChange = useCallback(
		(event: React.ChangeEvent<HTMLSelectElement>) => {
			setBrandNameHook(event.currentTarget.value);
		},
		[setBrandNameHook],
	);

	const hasUpdate =
		latestVersion !== '' &&
		currentVersion !== '' &&
		latestVersion !== currentVersion;

	return (
		<Overlay2
			onClose={handleClose}
			className={`${Classes.OVERLAY_SCROLL_CONTAINER} bp3-overlay-settings`}
			autoFocus
			canEscapeKeyClose
			canOutsideClickClose
			enforceFocus
			hasBackdrop
			isOpen={isSettingsOpen}
			usePortal
			transitionDuration={0}
		>
			<div className={classes.overlayInnerRoot}>
				<div
					id="settings-overlay-inner"
					className={`${classes.overlayInsideFade} ${Classes.CARD}`}
					style={{
						borderRadius: '0',
						height: '100%',
					}}
				>
					<CloseOverlayButton
						className={classes.absoluteCloseButton}
						onClick={handleClose}
						isDefaultStyles
					/>
					<div style={{ width: '100%' }}>
						{hasUpdate ? (
							<div className={classes.updateCalloutWrapper}>
								<Callout
									className={classes.updateCallout}
									icon="automatic-updates"
									intent="success"
									role="button"
									tabIndex={0}
									onClick={handleOpenDownload}
									onKeyDown={handleUpdateCalloutKeyDown}
								>
									<Text style={{ fontWeight: 600 }}>
										{t('deskreen-ce-update-is-available')}
									</Text>
									<Text>{`${t('your-current-version-is')} ${currentVersion}`}</Text>
									<Text>{`${t('click-to-download-new-updated-version')} ${latestVersion}`}</Text>
								</Callout>
							</div>
						) : null}
						<Row middle="xs">
							<H3 className="bp3-text-muted">{t('general-settings')}</H3>
						</Row>
						<div style={{ marginTop: '24px' }}>
							<SettingRowLabelAndInput
								icon="translate"
								label={t('language')}
								input={<LanguageSelector />}
							/>
						</div>
						<div style={{ marginTop: '24px' }}>
							<SettingRowLabelAndInput
								icon="contrast"
								label={t('color-theme')}
								input={<ToggleThemeBtnGroup />}
							/>
						</div>
						<div style={{ marginTop: '24px' }}>
							<SettingRowLabelAndInput
								icon="layout-grid"
								label={t('ui-style')}
								input={<ToggleUIStyleBtnGroup />}
							/>
						</div>
						<div style={{ marginTop: '24px' }}>
							<SettingRowLabelAndInput
								icon="power"
								label={t('auto-start-on-login')}
								input={
									<Switch
										checked={autoStartOnLogin}
										onChange={handleAutoStartChange}
										innerLabel={autoStartOnLogin ? t('on') : t('off')}
									/>
								}
							/>
						</div>
						<div style={{ marginTop: '24px' }}>
							<SettingRowLabelAndInput
								icon="warning-sign"
								label={t('prevent-accidental-quit')}
								input={
									<Switch
										checked={preventAccidentalQuit}
										onChange={handlePreventQuitChange}
										innerLabel={preventAccidentalQuit ? t('on') : t('off')}
									/>
								}
							/>
						</div>
						<div style={{ marginTop: '24px' }}>
							<SettingRowLabelAndInput
								icon="link"
								label={t('custom-server-port')}
								input={
									<NumericInput
										placeholder="3131"
										min={1}
										max={65535}
										buttonPosition="none"
										value={customServerPort}
										onValueChange={(_value, valueString) =>
											setCustomServerPort(valueString)
										}
										onBlur={handlePortBlur}
										style={{ width: '120px' }}
									/>
								}
							/>
							<Text className="bp3-text-muted">
								{t('restart-required-for-port')}
							</Text>
						</div>
						<div style={{ marginTop: '24px' }}>
							<SettingRowLabelAndInput
								icon="tag"
								label={t('brand-name')}
								input={
									<HTMLSelect value={brandName} onChange={handleBrandChange}>
										{BRAND_OPTIONS.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</HTMLSelect>
								}
							/>
						</div>
						<div style={{ marginTop: '32px' }}>
							<SettingRowLabelAndInput
								icon="reset"
								label={t('factory-reset')}
								input={
									<Button
										intent="danger"
										icon="reset"
										style={{ borderRadius: '100px' }}
										onClick={() => setIsFactoryResetAlertOpen(true)}
									>
										{t('factory-reset')}
									</Button>
								}
							/>
						</div>
						<Row center="xs" style={{ marginTop: '32px' }}>
							<Button
								style={{ borderRadius: '100px', minWidth: '200px' }}
								onClick={handleClose}
							>
								{t('close')}
							</Button>
						</Row>
						<div style={{ marginTop: '24px' }}>
							<SettingRowLabelAndInput
								icon="globe"
								label={t('network-interface')}
								input={
									<HTMLSelect
										value={networkInterfaceIP}
										onChange={handleInterfaceChange}
									>
										<option value="">
											{t('network-interface-auto')}
										</option>
										{networkInterfaces.map((iface) => (
											<option
												key={`${iface.name}-${iface.address}`}
												value={iface.address}
											>
												{`${iface.name} (${iface.address})`}
											</option>
										))}
									</HTMLSelect>
								}
							/>
						</div>
					</div>
				</div>
			</div>
			<Alert
				isOpen={isFactoryResetAlertOpen}
				onClose={() => setIsFactoryResetAlertOpen(false)}
				icon="warning-sign"
				cancelButtonText={t('cancel')}
				confirmButtonText={t('confirm-button-text')}
				intent="danger"
				canEscapeKeyCancel
				canOutsideClickCancel
				onCancel={() => setIsFactoryResetAlertOpen(false)}
				onConfirm={() => {
					setIsFactoryResetAlertOpen(false);
					void window.electron.ipcRenderer.invoke(
						IpcEvents.FactoryResetApp,
					);
				}}
				transitionDuration={0}
			>
				<H4>{t('factory-reset-confirm')}</H4>
				<Text>{t('this-step-can-not-be-undone')}</Text>
			</Alert>
		</Overlay2>
	);
}
