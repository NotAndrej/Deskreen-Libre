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
};

export const SettingsContext = React.createContext<SettingsContextInterface>(
	defaultSettingsContextValue,
);
