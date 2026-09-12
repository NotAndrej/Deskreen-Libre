import React, { useEffect, useState } from 'react';
import { Classes } from '@blueprintjs/core';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import type { ThemeSource, UIStyle } from '@renderer/contexts/SettingsContext';
import { IpcEvents } from '../../../common/IpcEvents.enum';

// TODO: move to 'constants' tsx file ?
export const LIGHT_UI_BACKGROUND = 'rgba(240, 248, 250, 1)';
export const DARK_UI_BACKGROUND = 'rgba(28, 33, 39, 1)';

interface ThemeUpdatePayload {
	themeSource: ThemeSource;
	shouldUseDarkColors: boolean;
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [currentLanguage, setCurrentLanguage] = useState('en');
	const [themeSource, setThemeSource] = useState<ThemeSource>('system');
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [uiStyle, setUIStyle] = useState<UIStyle>('legacy');

	const setCurrentLanguageHook = (newLang: string): void => {
		setCurrentLanguage(newLang);
	};

	const setThemeSourceHook = (newTheme: ThemeSource): void => {
		setThemeSource(newTheme);
		window.electron.ipcRenderer
			.invoke(IpcEvents.SetThemeSource, newTheme)
			.then((result: ThemeUpdatePayload) => {
				setThemeSource(result.themeSource);
				setIsDarkMode(result.shouldUseDarkColors);
			})
			.catch((error) => {
				console.error('Error setting theme source:', error);
			});
	};

	const setUIStyleHook = (newStyle: UIStyle): void => {
		setUIStyle(newStyle);
		window.electron.ipcRenderer
			.invoke(IpcEvents.SetUIStyle, newStyle)
			.catch((error) => {
				console.error('Error setting UI style:', error);
			});
	};

	useEffect(() => {
		window.electron.ipcRenderer
			.invoke(IpcEvents.GetThemeSource)
			.then((result: ThemeUpdatePayload) => {
				setThemeSource(result.themeSource);
				setIsDarkMode(result.shouldUseDarkColors);
			})
			.catch((error) => {
				console.error('Error getting theme source:', error);
			});

		window.electron.ipcRenderer
			.invoke(IpcEvents.GetUIStyle)
			.then((result: UIStyle) => {
				setUIStyle(result);
			})
			.catch((error) => {
				console.error('Error getting UI style:', error);
			});

		const handleThemeUpdated = (
			_: unknown,
			result: ThemeUpdatePayload,
		): void => {
			setThemeSource(result.themeSource);
			setIsDarkMode(result.shouldUseDarkColors);
		};

		window.electron.ipcRenderer.on(IpcEvents.ThemeUpdated, handleThemeUpdated);

		return () => {
			window.electron.ipcRenderer.removeListener(
				IpcEvents.ThemeUpdated,
				handleThemeUpdated,
			);
		};
	}, []);

	useEffect(() => {
		// Legacy Modern / Modern are dark-first designs — force Blueprint's own
		// dark component theming (Card/Dialog/Popover/Drawer) regardless of the
		// separate Color Theme setting, so the two systems can't disagree.
		const effectiveDarkMode = uiStyle !== 'legacy' ? true : isDarkMode;
		if (effectiveDarkMode) {
			document.body.classList.add(Classes.DARK);
		} else {
			document.body.classList.remove(Classes.DARK);
		}
	}, [isDarkMode, uiStyle]);

	useEffect(() => {
		// 'modern' shares the same refined dark theme as 'legacy-modern' for now —
		// the distinct sidebar/dashboard layout is a separate, larger follow-up.
		document.body.classList.toggle(
			'ui-legacy-modern',
			uiStyle === 'legacy-modern' || uiStyle === 'modern',
		);
	}, [uiStyle]);

	const value = {
		currentLanguage,
		setCurrentLanguageHook,
		themeSource,
		isDarkMode,
		setThemeSourceHook,
		uiStyle,
		setUIStyleHook,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};
