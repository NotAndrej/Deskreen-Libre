import React, { useEffect, useState } from 'react';
import { Classes } from '@blueprintjs/core';

export type ViewerAppTheme = 'dark' | 'light';

interface AppContextInterface {
	appLanguage: string;
	setAppLanguageHook: (val: string) => void;
	appTheme: ViewerAppTheme;
	setAppThemeHook: (val: ViewerAppTheme) => void;
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

	const setAppLanguageHook = (newLang: string) => {
		setAppLanguage(newLang);
	};

	const setAppThemeHook = (newTheme: ViewerAppTheme) => {
		setAppTheme(newTheme);
	};

	useEffect(() => {
		document.body.classList.toggle(Classes.DARK, appTheme === 'dark');
	}, [appTheme]);

	const value = {
		appLanguage,
		setAppLanguageHook,
		appTheme,
		setAppThemeHook,
	};

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
