import React, { useEffect, useState } from 'react';
import { Overlay2, Classes, H3, Text } from '@blueprintjs/core';
import { Col, Row } from 'react-flexbox-grid';
import { makeStyles } from 'tss-react/mui';
import CloseOverlayButton from '../CloseOverlayButton';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import { useTranslation } from 'react-i18next';

interface AboutOverlayProps {
	isAboutOpen: boolean;
	handleClose: () => void;
}

const useStyles = makeStyles()(() => ({
	// Blueprint's scroll-container overlay leaves .bp6-overlay-content
	// absolutely positioned with no centering, so center it ourselves.
	overlayInnerRoot: {
		position: 'fixed',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '90%',
		maxWidth: '420px',
	},
	overlayInsideFade: {
		padding: '32px 20px',
	},
	absoluteCloseButton: { position: 'absolute', left: 'calc(100% - 65px)' },
}));

export default function AboutOverlay(
	props: AboutOverlayProps,
): React.ReactElement {
	const { isAboutOpen, handleClose } = props;
	const [clientViewerPort, setClientViewerPort] = useState('80');
	const [currentVersion, setCurrentVersion] = useState('');

	const { t } = useTranslation();
	const { classes } = useStyles();

	useEffect(() => {
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetPort)
			.then((port) => {
				return setClientViewerPort(port);
			})
			.catch((error) => {
				console.error('Error getting port:', error);
			});
	}, []);

	useEffect(() => {
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

	return (
		<Overlay2
			onClose={handleClose}
			className={Classes.OVERLAY_SCROLL_CONTAINER}
			autoFocus
			canEscapeKeyClose
			canOutsideClickClose
			enforceFocus
			hasBackdrop
			isOpen={isAboutOpen}
			usePortal
			transitionDuration={0}
		>
			<div className={classes.overlayInnerRoot}>
				<div
					id="about-overlay-inner"
					className={`${classes.overlayInsideFade} ${Classes.CARD}`}
					style={{ borderRadius: '8px' }}
				>
					<CloseOverlayButton
						className={classes.absoluteCloseButton}
						onClick={handleClose}
						isDefaultStyles
					/>
					<Row center="xs" middle="xs" style={{ width: '100%' }}>
						<div>
							<Col xs={12}>
								<img
									src={`http://127.0.0.1:${clientViewerPort}/logo512.png`}
									alt="logo"
									style={{ width: '100px' }}
								/>
							</Col>
							<Col xs={12}>
								<H3>{t('about-deskreen')}</H3>
							</Col>
							<Col xs={12}>
								<Text>{`${t('version')}: ${currentVersion} (${currentVersion})`}</Text>
							</Col>
							<Col xs={12}>
								<Text>
									{`${t('copyright')} © ${new Date().getFullYear()} `}
									<a
										href="https://www.linkedin.com/in/pavlobu/"
										target="_blank"
										rel="noopener noreferrer"
										className="bp3-link"
										style={{
											color: '#106ba3',
											textDecoration: 'none',
										}}
									>
										Pavlo Buidenkov
									</a>
								</Text>
							</Col>
							<Col xs={12}>
								<Text>
									{`${t('website')}: `}
									<a
										href="https://www.deskreen.com"
										target="_blank"
										rel="noopener noreferrer"
										className="bp3-link"
										style={{
											color: '#106ba3',
											textDecoration: 'none',
										}}
									>
										https://www.deskreen.com
									</a>
								</Text>
							</Col>
						</div>
					</Row>
				</div>
			</div>
		</Overlay2>
	);
}
