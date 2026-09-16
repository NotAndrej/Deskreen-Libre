import React from 'react';
import { Button, Dialog, H3, Icon, Position, Tooltip } from '@blueprintjs/core';
import { Row, Col, Grid } from 'react-flexbox-grid';
import { IpcEvents } from '../../../../common/IpcEvents.enum';
import { useTranslation } from 'react-i18next';

interface UkraineSupportDialogProps {
	isOpen: boolean;
	handleClose: () => void;
}

// Pixel-and-text faithful restoration of upstream's March 2022 solidarity
// dialog (commit 3f9714d, "add GLORY TO UKRAINE GLORY TO HEROES"), removed
// upstream and rebuilt here from the original source — typos ("inverntory",
// "URKAINE") and all. Only the shell.openExternal calls became IPC invokes,
// as the modern codebase requires.
const TWEET_URL = 'https://twitter.com/Ukraine/status/1497294840110977024';
const TRANSLATE_URL =
	'https://translate.google.com/?sl=en&tl=auto&text=DESKREEN%20CREATOR%20IS%20A%20UKRAINIAN.%20UKRAINE%20NEEDS%20YOUR%20HELP%21%0A%E2%99%A5%EF%B8%8F%20Follow%20this%20link%20to%20support%20Ukraine%21%20%E2%99%A5%EF%B8%8F%0AIf%20you%20don%27t%20live%20in%20a%20cave%20and%20aware%20of%20what%20is%20going%20on%20in%20the%20world%2C%20Russian%20government%20had%20started%20global%20armed%20invasion%20on%20the%20territory%20of%20Ukraine%20on%20the%2024th%20of%20February%202022.%20This%20is%20for%20real%2C%20this%20is%20a%20WAR.%20Russian%20army%20is%20killing%20Ukrainian%20soldiers%2C%20Ukrainian%20civil%20citizens%20and%20Ukrainian%20children%20RIGHT%20NOW%20because%20Russian%20government%20gave%20them%20an%20order%20to%20do%20so.%20You%20can%20search%20online%20for%20thousands%20of%20videos%20of%20what%20is%20going%20on%20in%20Ukraine.%0AUkrainians%20fight%20brave%20for%20their%20land%20and%20will%20never%20give%20up.%20But%20you%20must%20understand%20that%20our%20country%20is%20fighting%20here%20not%20for%20our%20land%20only%2C%20but%20for%20the%20safety%20of%20the%20whole%20world.%20If%20Ukraine%20fails%20in%20this%20war%20with%20Russian%20army%20and%20Russian%20government%2C%20the%20security%20of%20all%20countries%20in%20the%20world%20will%20be%20under%20the%20threat%21%20Russian%20government%20and%20it%27s%20vicious%20allies%20and%20governments%20from%20other%20countries%20will%20be%20moving%20their%20armies%20to%20YOUR%20land%2C%20sooner%20or%20later.%0AYou%20must%20understand%20that%20now%20Ukraine%20has%20more%20people%20here%20willing%20to%20fight%20than%20weapons%2C%20military%20supplies%20and%20other%20inventory%20for%20them.%20If%20you%20CAN%20and%20WANT%20to%20support%20Ukraine%20and%20Ukrainian%20army%2C%20here%20is%20a%20tweet%20with%20instructions%20from%20OFFICIAL%20account%20of%20Ukraine%0A%E2%99%A5%EF%B8%8F%20Follow%20this%20link%20to%20support%20Ukraine%21%20%E2%99%A5%EF%B8%8F%0AGLORY%20TO%20UKRAINE%21%20GLORY%20TO%20UKRAINIAN%20HEROES%21%0AYOU%20MUST%20UNDERSTAND%20THAT%20THIS%20WAR%20WITH%20UKRAINE%20STARTED%20NOT%20THE%20PEOPLE%20OF%20RUSSIA%2C%20BUT%20THE%20EVIL%20RUSSIAN%20GOVERNMENT%21%20MOST%20OF%20RUSSIAN%20PEOPLE%20ARE%20PEACEFUL%20AND%20VERY%20KIND%21%20IT%20IS%20A%20RUSSIAN%20GOVERNMENT%20THAT%20STARTED%20A%20WAR%20WITH%20THE%20WORLD%20THAT%20STARTED%20IN%20UKRAINE%20ON%20THE%2024TH%20OF%20FEBRUARY%202022';

export default function UkraineSupportDialog(
	props: UkraineSupportDialogProps,
): React.ReactElement {
	const { isOpen, handleClose } = props;
	const { t } = useTranslation();

	const openExternal = (url: string): void => {
		void window.electron.ipcRenderer.invoke(IpcEvents.OpenExternalLink, url);
	};

	return (
		<Dialog
			isOpen={isOpen}
			onClose={handleClose}
			autoFocus
			usePortal={false}
			transitionDuration={0}
			style={{
				width: '98%',
				height: '98%',
			}}
		>
			<Grid>
				<div
					style={{
						height: '98%',
						maxHeight: '500px',
						overflowY: 'scroll',
					}}
				>
					<Row center="xs" middle="xs">
						<Col xs={2}>
							<Tooltip content="Click to translate" position={Position.BOTTOM}>
								<Button
									style={{
										backgroundColor: '#3DCC91',
										borderRadius: '50px',
										width: '60px',
										height: '60px',
									}}
									onClick={() => {
										openExternal(TRANSLATE_URL);
										handleClose();
									}}
								>
									<Icon icon="translate" size={40} color="white" />
								</Button>
							</Tooltip>
						</Col>
						<Col xs={10}>
							<H3>
								DESKREEN CREATOR IS A UKRAINIAN. 🇺🇦 UKRAINE 🇺🇦 NEEDS YOUR
								HELP!
							</H3>
							<Button
								style={{ fontSize: '20px', color: 'rgb(0, 255, 255)' }}
								onClick={() => {
									openExternal(TWEET_URL);
								}}
							>
								<i>
									<b>♥️ CLICK HERE TO DONATE TO UKRAINE! ♥️</b>
								</i>
							</Button>
						</Col>
					</Row>
					<Row center="xs">
						<p style={{ fontSize: '14px' }}>
							If you don&apos;t live in a cave and aware of what is going on
							in the world 🌍 , Russian 🇷🇺 government had started global
							armed invasion on the territory of Ukraine on the 24th of
							February 2022.
							<b>
								<i>
									This is for real, this is a WAR. Russian army is killing
									Ukrainian soldiers, Ukrainian civil citizens and Ukrainian
									children RIGHT NOW because Russian government gave them an
									order to do so.
								</i>
							</b>
							You can search online for thousands of videos of what is going
							on in Ukraine.
						</p>
						<p style={{ fontSize: '14px' }}>
							{' '}
							Ukrainians fight brave for their land and will never give up.
							But you must understand that our country is fighting here not
							for our land only, but for the safety of the whole world.
							❗️❗️❗️
							<b>
								<i>
									{' '}
									If Ukraine fails in this war with Russian army and Russian
									government, the security of all countries in the world 🌍
									will be under the threat! Russian government and it&apos;s
									vicious allies and governments from other countries will be
									moving their armies to YOUR land, sooner or later
								</i>
							</b>
							❗️❗️❗
						</p>
						<p style={{ fontSize: '14px' }}>
							You must understand that now Ukraine has more people here
							willing to fight than weapons, military supplies and other
							inverntory for them. If you CAN and WANT to support Ukraine 🇺🇦
							and Ukrainian army, here is a tweet with instructions from
							OFFICIAL ✅ account of Ukraine 🇺🇦
						</p>
					</Row>
					<Row center="xs">
						<Button
							style={{ fontSize: '20px', color: 'rgb(0, 255, 255)' }}
							onClick={() => {
								openExternal(TWEET_URL);
							}}
						>
							<i>
								<b>♥️ CLICK HERE TO GO TO A TWEET TO DONATE TO URKAINE! ♥️</b>
							</i>
						</Button>
					</Row>
					<Row center="xs">
						<p style={{ fontSize: '10px' }}>
							YOU MUST UNDERSTAND THAT THIS WAR WITH UKRAINE STARTED NOT THE
							PEOPLE OF RUSSIA, BUT THE EVIL RUSSIAN GOVERNMENT! MOST OF
							RUSSIAN PEOPLE ARE PEACEFUL AND VERY KIND! IT IS A RUSSIAN
							GOVERNMENT THAT STARTED A WAR WITH THE WORLD THAT STARTED IN
							UKRAINE ON THE 24TH OF FEBRUARY 2022
						</p>
					</Row>
					<Row center="xs" style={{ marginTop: '5px' }}>
						<Button
							minimal
							rightIcon="chevron-right"
							onClick={handleClose}
							style={{
								borderRadius: '50px',
								backgroundColor: '#137CBD',
								color: 'white',
							}}
						>
							{t('glory-to-ukraine-glory-to-ukrainian-heroes')}
						</Button>
					</Row>
				</div>
			</Grid>
		</Dialog>
	);
}
