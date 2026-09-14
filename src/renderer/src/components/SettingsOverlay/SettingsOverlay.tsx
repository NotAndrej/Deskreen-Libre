import React, { useCallback, useEffect, useState } from 'react';
import { Overlay2, Classes, H3, Text, Callout } from '@blueprintjs/core';
import { Row } from 'react-flexbox-grid';
import { makeStyles } from 'tss-react/mui';
import CloseOverlayButton from '../CloseOverlayButton';
import SettingRowLabelAndInput from './SettingRowLabelAndInput';
import LanguageSelector from '../LanguageSelector';
import ToggleThemeBtnGroup from '../ToggleThemeBtnGroup';
import ToggleUIStyleBtnGroup from '../ToggleUIStyleBtnGroup';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
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
	overlayInnerRoot: { width: '90%' },
	overlayInsideFade: {
		padding: '20px',
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
	}, []);

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
						borderRadius: '8px',
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
					</div>
				</div>
			</div>
		</Overlay2>
	);
}
