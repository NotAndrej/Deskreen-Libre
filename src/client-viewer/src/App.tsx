import React, { useEffect, useState } from 'react';
import MainView from './containers/MainView';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const isCurrentlyPrerendering = () => {
    return typeof document !== 'undefined' &&
      typeof document.prerendering === 'boolean'
      ? document.prerendering
      : false;
  };

  const [isTrulyVisible, setIsTrulyVisible] = useState(!isCurrentlyPrerendering());

  useEffect(() => {
    if (typeof document !== 'undefined' && typeof document.prerendering === 'boolean') {
      const handlePrerenderChange = () => setIsTrulyVisible(!document.prerendering);
      if (document.prerendering) {
        document.addEventListener('prerenderingchange', handlePrerenderChange, { once: true });
      }
      return () => document.removeEventListener('prerenderingchange', handlePrerenderChange);
    }
  }, []);

  if (!isTrulyVisible) return <LoadingScreen />;
  return <MainView />;
};

export default App;
