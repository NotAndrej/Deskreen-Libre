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

	// Legacy Modern / Modern are dark-first designs — force Blueprint's (and
	// MUI's) own dark component theming regardless of the separate Color
	// Theme setting, so the systems can't disagree on what's on screen.
	const effectiveDarkMode = uiStyle === 'modern' ? true : isDarkMode;

	useEffect(() => {
		if (effectiveDarkMode) {
			document.body.classList.add(Classes.DARK);
		} else {
			document.body.classList.remove(Classes.DARK);
		}
	}, [effectiveDarkMode]);

	useEffect(() => {
		document.body.classList.toggle('ui-modern', uiStyle === 'modern');
	}, [uiStyle]);

	const value = {
		currentLanguage,
		setCurrentLanguageHook,
		themeSource,
		isDarkMode,
		setThemeSourceHook,
		uiStyle,
		setUIStyleHook,
		effectiveDarkMode,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};
