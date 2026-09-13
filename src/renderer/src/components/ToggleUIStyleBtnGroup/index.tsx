import React, { useContext } from 'react';
import { SegmentedControl } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import type { UIStyle } from '@renderer/contexts/SettingsContext';

export default function ToggleUIStyleBtnGroup(): React.ReactElement {
	const { t } = useTranslation();
	const { uiStyle, setUIStyleHook } = useContext(SettingsContext);

	const handleValueChange = (value: string): void => {
		setUIStyleHook(value as UIStyle);
	};

	return (
		<div style={{ width: '220px' }}>
			<SegmentedControl
				value={uiStyle}
				onValueChange={handleValueChange}
				options={[
					{ label: t('ui-style-legacy'), value: 'legacy' },
					{ label: t('ui-style-modern'), value: 'modern' },
				]}
				small
				fill
			/>
		</div>
	);
}
