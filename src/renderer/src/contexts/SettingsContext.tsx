import React from 'react';

export type ThemeSource = 'system' | 'light' | 'dark';
export type UIStyle = 'legacy' | 'legacy-modern' | 'modern';

export interface SettingsContextInterface {
	currentLanguage: string;
	setCurrentLanguageHook: (newLang: string) => void;
	themeSource: ThemeSource;
	isDarkMode: boolean;
	setThemeSourceHook: (newTheme: ThemeSource) => void;
	uiStyle: UIStyle;
	setUIStyleHook: (newStyle: UIStyle) => void;
	/** isDarkMode, but forced true whenever uiStyle isn't 'legacy' — since
	 * Legacy Modern / Modern are dark-first and ignore the separate Color
	 * Theme setting. Use this (not isDarkMode) for anything that needs to
	 * match what's actually rendered on screen right now. */
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
	uiStyle: 'legacy',
	setUIStyleHook: () => {
		// noop default
	},
	effectiveDarkMode: false,
};

export const SettingsContext = React.createContext<SettingsContextInterface>(
	defaultSettingsContextValue,
);
