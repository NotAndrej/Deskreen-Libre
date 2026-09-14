import React, { useContext } from 'react';
import { Button, H3, Icon, Position, Tag, Tooltip } from '@blueprintjs/core';
import { makeStyles } from 'tss-react/mui';
import { Col, Row } from 'react-flexbox-grid';
import SettingsOverlay from './SettingsOverlay/SettingsOverlay';
import AboutOverlay from './AboutOverlay';
import ConnectedDevicesListDrawer from './ConnectedDevicesListDrawer';
import { useTranslation } from 'react-i18next';
import { IpcEvents } from '../../../common/IpcEvents.enum';
import { SettingsContext } from '@renderer/contexts/SettingsContext';

const useStyles = makeStyles()(() => ({
		topPanelRoot: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			paddingTop: '15px',
			marginBottom: '20px',
			position: 'relative',
			gap: '12px',
		},
		logoWithAppName: { margin: '0 auto' },
		appNameHeader: {
			margin: '0 auto',
			paddingTop: '5px',
			fontFamily: 'Lexend Peta',
			fontSize: '20px',
			color: '#e2791b',
			cursor: 'default !important',
		},
		topPanelControlButtonsRoot: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
		},
		topPanelControlsWrapper: {
			position: 'absolute',
			right: '15px',
			top: '15px',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'flex-end',
			gap: '6px',
		},
		topPanelControlButton: {
			width: '40px',
			height: '40px',
			borderRadius: '50px',
			cursor: 'default !important',
		},
		topPanelControlButtonMargin: {
			cursor: 'default !important',
			position: 'relative',
		},
		updateBadge: {
			borderRadius: '12px',
			cursor: 'pointer',
			boxShadow: 'none',
		},
		topPanelIconOfControlButton: {
			cursor: 'default !important',
		},
		connectedDevicesBadge: {
			position: 'absolute',
			top: '-4px',
			right: '-4px',
			backgroundColor: '#ff3b30',
			color: '#ffffff',
			borderRadius: '10px',
			minWidth: '20px',
			height: '20px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: '12px',
			fontWeight: 600,
			padding: '0 6px',
			boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
			zIndex: 10,
			lineHeight: '1',
		},
		// "Legacy Modern" / "Modern" header — flat row, monotone icons, no
		// colored button fills. Only ever shown while dark mode is forced (see
		// SettingsProvider's effectiveDarkMode), so these dark-only colors are
		// fine for now; they'll need light-mode counterparts when Legacy
		// Modern / Modern get proper light variants.
		modernHeaderRoot: {
			display: 'flex',
			alignItems: 'center',
			width: '100%',
			padding: '34px 20px 14px',
			marginBottom: '20px',
			borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
			boxSizing: 'border-box',
		},
		modernHeaderAppName: {
			flex: 1,
			fontSize: '15px',
			fontWeight: 500,
			cursor: 'default',
		},
		modernHeaderIconsRoot: {
			display: 'flex',
			alignItems: 'center',
			gap: '6px',
		},
		modernHeaderIconButton: {
			cursor: 'default !important',
			color: 'rgba(255, 255, 255, 0.6) !important',
		},
}));

interface Props {
	handleReset: () => void;
	children?: React.ReactNode;
}

export default function TopPanel({
	handleReset,
	children,
}: Props): React.ReactElement {
	const { t } = useTranslation();
	const { classes } = useStyles();
	const { uiStyle } = useContext(SettingsContext);

	const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
	const [isAboutOpen, setIsAboutOpen] = React.useState(false);
	const [isConnectedDevicesDrawerOpen, setIsConnectedDevicesDrawerOpen] =
		React.useState(false);
	const [latestVersion, setLatestVersion] = React.useState('');
	const [currentVersion, setCurrentVersion] = React.useState('');
	const [connectedDevicesCount, setConnectedDevicesCount] = React.useState(0);

	const handleSettingsOpen = React.useCallback(() => {
		setIsSettingsOpen(true);
	}, []);

	const handleSettingsClose = React.useCallback(() => {
		setIsSettingsOpen(false);
	}, []);

	const handleAboutOpen = React.useCallback(() => {
		setIsAboutOpen(true);
	}, []);

	const handleAboutClose = React.useCallback(() => {
		setIsAboutOpen(false);
	}, []);

	const handleToggleConnectedDevicesListDrawer = React.useCallback(() => {
		setIsConnectedDevicesDrawerOpen(!isConnectedDevicesDrawerOpen);
	}, [isConnectedDevicesDrawerOpen]);

	const handleTutorialButtonClick = React.useCallback(() => {
		window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://deskreen.com/howto',
		);
	}, []);

	const handleOpenDownloadPage = React.useCallback((): void => {
		void window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://github.com/NotAndrej/Deskreen-Libre/releases',
		);
	}, []);

	React.useEffect(() => {
		const fetchVersions = async (): Promise<void> => {
			const [latest, current] = await Promise.all([
				window.electron.ipcRenderer.invoke('get-latest-version'),
				window.electron.ipcRenderer.invoke('get-current-version'),
			]);
			if (typeof latest === 'string') {
				setLatestVersion(latest);
			}
			if (typeof current === 'string') {
				setCurrentVersion(current);
			}
		};

		void fetchVersions();
	}, []);

	React.useEffect(() => {
		const fetchConnectedDevicesCount = async (): Promise<void> => {
			try {
				const devices = await window.electron.ipcRenderer.invoke(
					IpcEvents.GetConnectedDevices,
				);
				if (Array.isArray(devices)) {
					setConnectedDevicesCount(devices.length);
				}
			} catch (e) {
				console.error(e);
			}
		};

		fetchConnectedDevicesCount();

		const connectedDevicesInterval = setInterval(
			fetchConnectedDevicesCount,
			2000,
		);

		return () => {
			clearInterval(connectedDevicesInterval);
		};
	}, []);

	const hasUpdate =
		latestVersion !== '' &&
		currentVersion !== '' &&
		latestVersion !== currentVersion;

	const renderConnectedDevicesListButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('connected-devices')} position={Position.BOTTOM}>
				<Button
					id="top-panel-connected-devices-list-button"
					intent="primary"
					className={classes.topPanelControlButton}
					onClick={handleToggleConnectedDevicesListDrawer}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="th-list"
						size={20}
					/>
				</Button>
			</Tooltip>
			{connectedDevicesCount > 0 && (
				<span className={classes.connectedDevicesBadge}>
					{connectedDevicesCount}
				</span>
			)}
		</div>
	);

	const renderTutorialButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('tutorial')} position={Position.BOTTOM}>
				<Button
					id="top-panel-tutorial-button"
					className={classes.topPanelControlButton}
					onClick={handleTutorialButtonClick}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="learning"
						size={22}
					/>
				</Button>
			</Tooltip>
		</div>
	);

	const renderHelpButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('fix-reset-tooltip')} position={Position.BOTTOM}>
				<Button
					id="top-panel-help-button"
					intent="danger"
					className={classes.topPanelControlButton}
					onClick={() => {
						Promise.resolve(handleReset()).then(() => {
							window.electron.ipcRenderer.invoke(
								IpcEvents.CreateWaitingForConnectionSharingSession,
							);
						});
					}}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="lifesaver"
						size={22}
					/>
				</Button>
			</Tooltip>
		</div>
	);

	const renderAboutButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('about')} position={Position.BOTTOM}>
				<Button
					id="top-panel-about-button"
					onClick={handleAboutOpen}
					className={classes.topPanelControlButton}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="info-sign"
						size={22}
					/>
				</Button>
			</Tooltip>
		</div>
	);

	const renderSettingsButton = (
		<div className={classes.topPanelControlButtonMargin}>
			<Tooltip content={t('settings')} position={Position.BOTTOM}>
				<Button
					id="top-panel-settings-button"
					onClick={handleSettingsOpen}
					className={classes.topPanelControlButton}
				>
					<Icon
						className={classes.topPanelIconOfControlButton}
						icon="cog"
						size={22}
					/>
				</Button>
			</Tooltip>
		</div>
	);

	const renderLogoWithAppName = (
		<div
			id="logo-with-popover-visit-website"
			className={classes.logoWithAppName}
		>
			<H3>Deskreen Libre</H3>
		</div>
	);

	const renderModernHeader = (
		<div className={classes.modernHeaderRoot}>
			<span className={classes.modernHeaderAppName}>Deskreen Libre</span>
			<div className={classes.modernHeaderIconsRoot}>
				<div style={{ position: 'relative' }}>
					<Tooltip content={t('connected-devices')} position={Position.BOTTOM}>
						<Button
							id="top-panel-connected-devices-list-button"
							minimal
							className={classes.modernHeaderIconButton}
							onClick={handleToggleConnectedDevicesListDrawer}
						>
							<Icon icon="th-list" size={18} />
						</Button>
					</Tooltip>
					{connectedDevicesCount > 0 && (
						<span className={classes.connectedDevicesBadge}>
							{connectedDevicesCount}
						</span>
					)}
				</div>
				<Tooltip content={t('fix-reset-tooltip')} position={Position.BOTTOM}>
					<Button
						id="top-panel-help-button"
						minimal
						className={classes.modernHeaderIconButton}
						onClick={() => {
							Promise.resolve(handleReset()).then(() => {
								window.electron.ipcRenderer.invoke(
									IpcEvents.CreateWaitingForConnectionSharingSession,
								);
							});
						}}
					>
						<Icon icon="lifesaver" size={18} />
					</Button>
				</Tooltip>
				<Tooltip content={t('tutorial')} position={Position.BOTTOM}>
					<Button
						id="top-panel-tutorial-button"
						minimal
						className={classes.modernHeaderIconButton}
						onClick={handleTutorialButtonClick}
					>
						<Icon icon="learning" size={18} />
					</Button>
				</Tooltip>
				<Tooltip content={t('about')} position={Position.BOTTOM}>
					<Button
						id="top-panel-about-button"
						minimal
						className={classes.modernHeaderIconButton}
						onClick={handleAboutOpen}
					>
						<Icon icon="info-sign" size={18} />
					</Button>
				</Tooltip>
				<Tooltip content={t('settings')} position={Position.BOTTOM}>
					<Button
						id="top-panel-settings-button"
						minimal
						className={classes.modernHeaderIconButton}
						onClick={handleSettingsOpen}
					>
						<Icon icon="cog" size={18} />
					</Button>
				</Tooltip>
				{hasUpdate ? (
					<Tag
						minimal
						intent="success"
						round
						role="button"
						onClick={handleOpenDownloadPage}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								handleOpenDownloadPage();
							}
						}}
						tabIndex={0}
					>
						{t('new-version-available')}
					</Tag>
				) : null}
			</div>
		</div>
	);

	const renderLegacyHeader = (
		<div className={classes.topPanelRoot}>
			<Row middle="xs" center="xs" style={{ width: '100%' }}>
				<Col>{renderLogoWithAppName}</Col>
			</Row>
			<div className={classes.topPanelControlsWrapper}>
				<div className={classes.topPanelControlButtonsRoot}>
					{renderConnectedDevicesListButton}
					{renderHelpButton}
					{renderTutorialButton}
					{renderAboutButton}
					{renderSettingsButton}
				</div>
				{hasUpdate ? (
					<Tag
						minimal
						intent="success"
						round
						className={classes.updateBadge}
						role="button"
						onClick={handleOpenDownloadPage}
						onKeyDown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								handleOpenDownloadPage();
							}
						}}
						tabIndex={0}
					>
						{t('new-version-available')}
					</Tag>
				) : null}
			</div>
		</div>
	);

	return (
		<>
			{uiStyle === 'modern' ? renderModernHeader : renderLegacyHeader}
			{children}
			{isSettingsOpen ? (
				<SettingsOverlay
					isSettingsOpen={isSettingsOpen}
					handleClose={handleSettingsClose}
				/>
			) : (
				<></>
			)}
			{isAboutOpen ? (
				<AboutOverlay isAboutOpen={isAboutOpen} handleClose={handleAboutClose} />
			) : (
				<></>
			)}
			{isConnectedDevicesDrawerOpen ? (
				<ConnectedDevicesListDrawer
					isOpen={isConnectedDevicesDrawerOpen}
					handleToggle={handleToggleConnectedDevicesListDrawer}
					handleReset={handleReset}
				/>
			) : (
				<></>
			)}
		</>
	);
}
