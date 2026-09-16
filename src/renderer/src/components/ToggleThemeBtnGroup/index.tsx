import React, { useContext } from 'react';
import { SegmentedControl } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import type { ThemeSource } from '@renderer/contexts/SettingsContext';

export default function ToggleThemeBtnGroup(): React.ReactElement {
	const { t } = useTranslation();
	const { themeSource, setThemeSourceHook } = useContext(SettingsContext);

	const handleValueChange = (value: string): void => {
		setThemeSourceHook(value as ThemeSource);
	};

	return (
		<div style={{ width: '100%', minWidth: '240px', maxWidth: '360px' }}>
			<SegmentedControl
				value={themeSource}
				onValueChange={handleValueChange}
				options={[
					{ label: t('light'), value: 'light', icon: 'flash' },
					{ label: t('dark'), value: 'dark', icon: 'moon' },
					{ label: t('auto'), value: 'system', icon: 'desktop' },
				]}
				fill
			/>
		</div>
	);
}
