import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { makeStyles } from 'tss-react/mui';
import { StepIconProps } from '@mui/material/StepIcon';
import { Icon } from '@blueprintjs/core';

export interface StepIconPropsDeskreen extends StepIconProps {
	isEntireScreenSelected: boolean;
	isApplicationWindowSelected: boolean;
}

const useColorlibStepIconStyles = makeStyles()(() => ({
	root: {
		backgroundColor: '#BFCCD6',
		zIndex: 1,
		color: '#5C7080',
		width: 65,
		height: 65,
		display: 'flex',
		borderRadius: '50%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	active: {
		backgroundImage: 'var(--stepper-active-gradient)',
		boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
	},
	completed: {
		backgroundImage: 'var(--stepper-completed-gradient)',
	},
	stepContent: {},
}));

const getDesktopOrAppIcon = (isDesktop: boolean, color: string): ReactNode => {
	if (isDesktop) {
		return <Icon icon="desktop" size={25} color={color} />;
	}
	return <Icon icon="application" size={25} color={color} />;
};

export default function ColorlibStepIcon(
	props: StepIconPropsDeskreen,
): ReactNode {
	const { icon } = props;
	const { classes } = useColorlibStepIconStyles();
	const { active, completed, isEntireScreenSelected } = props;

	const color = active || completed ? '#fff' : '#5C7080';

	const icons: { [index: string]: React.ReactNode } = {
		1: completed ? (
			<Icon icon="feed-subscribed" size={25} color={color} />
		) : (
			<Icon icon="feed" size={25} color={color} />
		),
		2: completed ? (
			getDesktopOrAppIcon(isEntireScreenSelected, color)
		) : (
			<Icon icon="flow-branch" size={25} color={color} />
		),
		3: completed ? (
			<Icon icon="tick-circle" size={25} color={color} />
		) : (
			<Icon icon="confirm" size={25} color={color} />
		),
	};

	return (
		<div
			className={`${clsx(classes.root, {
				[classes.active]: active,
				[classes.completed]: completed,
			})}`}
		>
			{icons[String(icon)]}
		</div>
	);
}
