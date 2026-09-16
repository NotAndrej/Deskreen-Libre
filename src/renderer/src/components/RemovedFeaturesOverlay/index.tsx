import React, { useState } from 'react';
import {
	Overlay2,
	Classes,
	H3,
	Text,
	Button,
	Card,
} from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { makeStyles } from 'tss-react/mui';
import CloseOverlayButton from '../CloseOverlayButton';
import UkraineSupportDialog from '../UkraineSupportDialog';
import { useTranslation } from 'react-i18next';

interface RemovedFeaturesOverlayProps {
	isOpen: boolean;
	handleClose: () => void;
}

const useStyles = makeStyles()(() => ({
	overlayInnerRoot: {
		position: 'fixed',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '90%',
		maxWidth: '520px',
	},
	overlayInsideFade: {
		padding: '32px 20px',
	},
	absoluteCloseButton: { position: 'absolute', left: 'calc(100% - 65px)' },
	featureCard: {
		marginTop: '16px',
		padding: '16px',
	},
}));

// A small museum of features upstream removed: each entry explains itself
// and can trigger the restored thing. Add new exhibits here as they come.
export default function RemovedFeaturesOverlay(
	props: RemovedFeaturesOverlayProps,
): React.ReactElement {
	const { isOpen, handleClose } = props;
	const { t } = useTranslation();
	const { classes } = useStyles();
	const [isUkraineDialogOpen, setIsUkraineDialogOpen] = useState(false);

	return (
		<Overlay2
			onClose={handleClose}
			className={Classes.OVERLAY_SCROLL_CONTAINER}
			autoFocus
			canEscapeKeyClose
			canOutsideClickClose
			enforceFocus
			hasBackdrop
			isOpen={isOpen}
			usePortal
			transitionDuration={0}
		>
			<div className={classes.overlayInnerRoot}>
				<div
					className={`${classes.overlayInsideFade} ${Classes.CARD}`}
					style={{ borderRadius: '8px' }}
				>
					<CloseOverlayButton
						className={classes.absoluteCloseButton}
						onClick={handleClose}
						isDefaultStyles
					/>
					<Row center="xs" style={{ width: '100%' }}>
						<Col xs={12}>
							<H3>{t('removed-features')}</H3>
						</Col>
					</Row>
					<Card className={classes.featureCard}>
						<Row middle="xs" between="xs">
							<Col xs={8}>
								<Text style={{ fontWeight: 600 }}>
									{t('ukraine-support')}
								</Text>
								<Text className="bp3-text-muted">
									{t('ukraine-support-description')}
								</Text>
							</Col>
							<Col xs={4} style={{ textAlign: 'right' }}>
								<Button
									intent="primary"
									style={{ borderRadius: '100px' }}
									onClick={() => setIsUkraineDialogOpen(true)}
								>
									{t('show')}
								</Button>
							</Col>
						</Row>
					</Card>
				</div>
			</div>
			<UkraineSupportDialog
				isOpen={isUkraineDialogOpen}
				handleClose={() => setIsUkraineDialogOpen(false)}
			/>
		</Overlay2>
	);
}
