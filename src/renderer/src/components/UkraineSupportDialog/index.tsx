import React from 'react';
import { Button, Dialog, Classes, H3, Text } from '@blueprintjs/core';
import { IpcEvents } from '../../../../common/IpcEvents.enum';

interface UkraineSupportDialogProps {
	isOpen: boolean;
	handleClose: () => void;
}

// Restored from upstream's 2022 solidarity appeal (removed upstream, text
// transcribed from the original dialog). Deliberately English-only, as was
// the original.
export default function UkraineSupportDialog(
	props: UkraineSupportDialogProps,
): React.ReactElement {
	const { isOpen, handleClose } = props;

	const openDonatePage = (): void => {
		void window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://u24.gov.ua/',
		);
	};

	const openOfficialAccount = (): void => {
		void window.electron.ipcRenderer.invoke(
			IpcEvents.OpenExternalLink,
			'https://x.com/Ukraine',
		);
	};

	return (
		<Dialog
			isOpen={isOpen}
			onClose={handleClose}
			canEscapeKeyClose
			canOutsideClickClose
			transitionDuration={0}
			usePortal={false}
			style={{ width: '90%', maxWidth: '640px' }}
		>
			<div className={Classes.DIALOG_BODY}>
				<H3 style={{ textAlign: 'center' }}>
					DESKREEN CREATOR IS A UKRAINIAN. UKRAINE NEEDS YOUR HELP!
				</H3>
				<div style={{ textAlign: 'center', margin: '12px 0' }}>
					<Button intent="primary" onClick={openDonatePage}>
						♥ CLICK HERE TO DONATE TO UKRAINE! ♥
					</Button>
				</div>
				<Text>
					If you don&apos;t live in a cave and are aware of what is going on in
					the world, you must know that Russia started a global armed
					invasion on the territory of Ukraine on the 24th of February 2022.
					This is for real, this is a WAR. The Russian army is killing
					Ukrainian soldiers and Ukrainian civilians RIGHT NOW because the
					Russian government gave them an order to do so.
				</Text>
				<br />
				<Text>
					Ukrainians fight brave for their land and will never give up. But
					you must understand that our country is fighting here not for our
					land only, but for the safety of the whole world! If Ukraine fails
					in this war with the Russian army and Russian government, the
					security of all countries in the world will be under threat! The
					Russian government and its vicious allies will be moving their
					armies to YOUR land, sooner or later!
				</Text>
				<br />
				<Text>
					If you CAN and WANT to support Ukraine and the Ukrainian army,
					instructions from the OFFICIAL account of Ukraine:
				</Text>
				<div style={{ textAlign: 'center', margin: '12px 0' }}>
					<Button onClick={openOfficialAccount}>
						CLICK HERE TO GO TO THE OFFICIAL ACCOUNT OF UKRAINE
					</Button>
				</div>
				<div style={{ textAlign: 'center', margin: '12px 0' }}>
					<Button intent="primary" onClick={openDonatePage}>
						♥ CLICK HERE TO DONATE TO UKRAINE! ♥
					</Button>
				</div>
				<div style={{ textAlign: 'center', marginTop: '16px' }}>
					<Button intent="success" onClick={handleClose}>
						GLORY TO UKRAINE! GLORY TO UKRAINIAN HEROES!
					</Button>
				</div>
			</div>
		</Dialog>
	);
}
