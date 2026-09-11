import { styled } from '@mui/material/styles';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

const ColorlibConnector = styled(StepConnector)(() => ({
	[`&.${stepConnectorClasses.alternativeLabel}`]: {
		top: 43,
	},
	[`&.${stepConnectorClasses.active}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundImage:
				'linear-gradient( 95deg, #3DCC91 0%, #15B371 50%, #FFB366 100%)',
		},
	},
	[`&.${stepConnectorClasses.completed}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			backgroundImage:
				'linear-gradient( 95deg, #3DCC91 0%, #15B371 50%, #3DCC91 100%)',
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
