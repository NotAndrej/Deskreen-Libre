import React, { useEffect, useState } from 'react';
import { Classes } from '@blueprintjs/core';
import { SettingsContext } from '@renderer/contexts/SettingsContext';
import type { ThemeSource, UIStyle } from '@renderer/contexts/SettingsContext';
import { BRAND_DEFAULT } from '../../../common/brandNames';
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
	const [uiStyle, setUIStyle] = useState<UIStyle>('modern');
	const [brandName, setBrandName] = useState(BRAND_DEFAULT);

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

	const setBrandNameHook = (newBrand: string): void => {
		window.electron.ipcRenderer
			.invoke(IpcEvents.SetBrandName, newBrand)
			.then((normalized: string) => {
				setBrandName(normalized);
			})
			.catch((error) => {
				console.error('Error setting brand name:', error);
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

		window.electron.ipcRenderer
			.invoke(IpcEvents.GetBrandName)
			.then((result: string) => {
				setBrandName(result);
			})
			.catch((error) => {
				console.error('Error getting brand name:', error);
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

	// Effective dark mode is purely the Color Theme setting (Light / Dark /
	// OS Auto) — both Legacy and Modern fully support light and dark, so
	// nothing is forced anymore.
	const effectiveDarkMode = isDarkMode;

	useEffect(() => {
		if (effectiveDarkMode) {
			document.body.classList.add(Classes.DARK);
		} else {
			document.body.classList.remove(Classes.DARK);
		}
	}, [effectiveDarkMode]);

	useEffect(() => {
		document.body.classList.toggle('ui-modern', uiStyle === 'modern');
		document.body.classList.toggle('ui-classic', uiStyle === 'classic');
	}, [uiStyle]);

	useEffect(() => {
		// The HTML <title> wins over the BrowserWindow title option, so sync
		// it here: covers both startup (after the stored brand loads) and
		// live changes.
		document.title = brandName;
	}, [brandName]);

	const value = {
		currentLanguage,
		setCurrentLanguageHook,
		themeSource,
		isDarkMode,
		setThemeSourceHook,
		uiStyle,
		setUIStyleHook,
		brandName,
		setBrandNameHook,
		effectiveDarkMode,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};
