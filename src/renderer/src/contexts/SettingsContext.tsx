import React from 'react';

export type ThemeSource = 'system' | 'light' | 'dark';
export type UIStyle = 'legacy' | 'modern' | 'classic';

export interface SettingsContextInterface {
	currentLanguage: string;
	setCurrentLanguageHook: (newLang: string) => void;
	themeSource: ThemeSource;
	isDarkMode: boolean;
	setThemeSourceHook: (newTheme: ThemeSource) => void;
	uiStyle: UIStyle;
	setUIStyleHook: (newStyle: UIStyle) => void;
	brandName: string;
	setBrandNameHook: (newBrand: string) => void;
	/** Resolved dark mode from the Color Theme setting (Light / Dark / OS
	 * Auto). Both Legacy and Modern have full light and dark variants.
	 * Use this (not isDarkMode) for anything that needs to match what's
	 * actually rendered on screen right now. */
	effectiveDarkMode: boolean;
}

export const defaultSettingsContextValue: SettingsContextInterface = {
	setCurrentLanguageHook: () => {
		// noop default
	},
	currentLanguage: 'en',
	themeSource: 'system',
	isDarkMode: false,
	setThemeSourceHook: () => {
		// noop default
	},
	uiStyle: 'modern',
	setUIStyleHook: () => {
		// noop default
	},
	brandName: 'Deskreen Libre',
	setBrandNameHook: () => {
		// noop default
	},
	effectiveDarkMode: false,
};

export const SettingsContext = React.createContext<SettingsContextInterface>(
	defaultSettingsContextValue,
);
