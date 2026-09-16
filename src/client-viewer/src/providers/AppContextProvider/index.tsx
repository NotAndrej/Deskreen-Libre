import React, { useEffect, useState } from 'react';
import { Classes } from '@blueprintjs/core';

export type ViewerAppTheme = 'dark' | 'light';
export type ViewerAppUiStyle = 'legacy' | 'modern';

interface AppContextInterface {
	appLanguage: string;
	setAppLanguageHook: (val: string) => void;
	appTheme: ViewerAppTheme;
	setAppThemeHook: (val: ViewerAppTheme) => void;
	appUiStyle: ViewerAppUiStyle;
	setAppUiStyleHook: (val: ViewerAppUiStyle) => void;
	appBrand: string;
	setAppBrandHook: (val: string) => void;
}

const defaultAppContextValue = {
	appLanguage: 'en',
	setAppLanguageHook: () => {
		// noop default
	},
	appTheme: 'light' as ViewerAppTheme,
	setAppThemeHook: () => {
		// noop default
	},
	appUiStyle: 'legacy' as ViewerAppUiStyle,
	setAppUiStyleHook: () => {
		// noop default
	},
	appBrand: 'Deskreen Libre',
	setAppBrandHook: () => {
		// noop default
	},
};

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = React.createContext<AppContextInterface>(
	defaultAppContextValue,
);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [appLanguage, setAppLanguage] = useState('en');
	const [appTheme, setAppTheme] = useState<ViewerAppTheme>('light');
	const [appUiStyle, setAppUiStyle] = useState<ViewerAppUiStyle>('legacy');
	const [appBrand, setAppBrand] = useState('Deskreen Libre');

	const setAppLanguageHook = (newLang: string) => {
		setAppLanguage(newLang);
	};

	const setAppThemeHook = (newTheme: ViewerAppTheme) => {
		setAppTheme(newTheme);
	};

	const setAppUiStyleHook = (newUiStyle: ViewerAppUiStyle) => {
		setAppUiStyle(newUiStyle);
	};

	const setAppBrandHook = (newBrand: string) => {
		setAppBrand(newBrand);
	};

	useEffect(() => {
		document.body.classList.toggle(Classes.DARK, appTheme === 'dark');
	}, [appTheme]);

	useEffect(() => {
		document.body.classList.toggle('ui-modern', appUiStyle === 'modern');
	}, [appUiStyle]);

	const value = {
		appLanguage,
		setAppLanguageHook,
		appTheme,
		setAppThemeHook,
		appUiStyle,
		setAppUiStyleHook,
		appBrand,
		setAppBrandHook,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
