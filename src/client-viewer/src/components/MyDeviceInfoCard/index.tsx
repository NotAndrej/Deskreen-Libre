import { Callout, Card, H3, Text, Tooltip, Position, EditableText } from '@blueprintjs/core';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	LIGHT_UI_BACKGROUND,
	DARK_UI_BACKGROUND,
	MODERN_LIGHT_UI_BACKGROUND,
	MODERN_DARK_UI_BACKGROUND,
} from '../../constants/styleConstants';
import { AppContext } from '../../providers/AppContextProvider';
import { getViewerAlias, setViewerAlias } from '../../utils/viewerAlias';

interface MyDeviceDetailsCardProps {
	deviceDetails: DeviceDetails;
}

function MyDeviceInfoCard(props: MyDeviceDetailsCardProps) {
	const { t } = useTranslation();
	const { appTheme, appUiStyle } = useContext(AppContext);
	const [alias, setAlias] = useState(getViewerAlias());
	const backgroundColor =
		appUiStyle === 'modern'
			? appTheme === 'dark'
				? MODERN_DARK_UI_BACKGROUND
				: MODERN_LIGHT_UI_BACKGROUND
			: appTheme === 'dark'
				? DARK_UI_BACKGROUND
				: LIGHT_UI_BACKGROUND;

	const { deviceDetails } = props;
	const { myIP, myOS, myDeviceType, myBrowser, myRoomId } = deviceDetails;

	return (
		<Card
			elevation={3}
			style={{
				backgroundColor,
				marginBottom: '30px',
			}}
		>
			<H3>{`${t('My Device Info')}:`}</H3>
			<Callout>
				<Text>
					{`${t('Device Alias')}: `}
					<EditableText
						value={alias}
						placeholder={t('Name this device')}
						onChange={(value) => setAlias(value)}
						onConfirm={(value) => {
							setViewerAlias(value);
							setAlias(getViewerAlias());
						}}
					/>
				</Text>
				<Text>{`${t('Device Type')}: ${myDeviceType}`}</Text>
				<Tooltip
					content={t(
						'Your Device IP should match with Device IP in alert popup appeared on your computer, where Deskreen-CE is running',
					)}
					position={Position.TOP}
				>
					<div
						style={{
							fontWeight: 900,
							backgroundColor: '#00f99273',
							paddingLeft: '10px',
							paddingRight: '10px',
							borderRadius: '20px',
						}}
					>
						<Text>{`${t('Device IP')}: ${myIP}`}</Text>
					</div>
				</Tooltip>
				<Text>{`${t('Device Browser')}: ${myBrowser}`}</Text>
				<Text>{`${t('Device OS')}: ${myOS}`}</Text>
				<Text>{`${t('My Current Connection ID')}: ${myRoomId}`}</Text>
			</Callout>
			<Text className="bp3-text-muted">
				{t(
					'These details should match with the ones that you see in alert popup on computer screen, where Deskreen-CE is running',
				)}
			</Text>
		</Card>
	);
}

export default MyDeviceInfoCard;
