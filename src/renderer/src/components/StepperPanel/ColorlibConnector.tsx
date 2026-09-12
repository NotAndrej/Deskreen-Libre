import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

const ColorlibConnector = styled(StepConnector)(() => ({
	[`&.${stepConnectorClasses.alternativeLabel}`]: {
		top: 43,
	},
	[`&.${stepConnectorClasses.active}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundImage: 'var(--connector-active-gradient)',
		},
	},
	[`&.${stepConnectorClasses.completed}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundImage: 'var(--connector-completed-gradient)',
		},
	},
	[`& .${stepConnectorClasses.line}`]: {
		height: 2,
		border: 0,
		backgroundColor: '#CED9E0',
		borderRadius: 1,
	},
}));

export default ColorlibConnector;
