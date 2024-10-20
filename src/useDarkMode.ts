import { useEffect, useState } from "react";

export function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(false);
  
    useEffect(() => {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(darkModeMediaQuery.matches);
  
      const listener = () => setIsDarkMode(darkModeMediaQuery.matches);
      darkModeMediaQuery.addEventListener('change', listener);
  
      return () => darkModeMediaQuery.removeEventListener('change', listener);
    }, []);
  
    return isDarkMode;
  }