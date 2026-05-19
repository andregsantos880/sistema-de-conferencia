import { useEffect, useState } from 'react';

export interface ThemeTokens {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
  chart7: string;
  chart8: string;
  muted: string;
  accent: string;
  success: string;
  warning: string;
  destructive: string;
  background: string;
  foreground: string;
  border: string;
}

/**
 * Hook to access CSS theme tokens for charts and widgets
 */
export function useThemeTokens(): ThemeTokens {
  const [tokens, setTokens] = useState<ThemeTokens>(() => getComputedTokens());

  useEffect(() => {
    // Update tokens when theme changes
    const observer = new MutationObserver(() => {
      setTokens(getComputedTokens());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  return tokens;
}

function getComputedTokens(): ThemeTokens {
  const style = getComputedStyle(document.documentElement);

  return {
    chart1: getCSSVariable(style, '--chart-1'),
    chart2: getCSSVariable(style, '--chart-2'),
    chart3: getCSSVariable(style, '--chart-3'),
    chart4: getCSSVariable(style, '--chart-4'),
    chart5: getCSSVariable(style, '--chart-5'),
    chart6: getCSSVariable(style, '--chart-6'),
    chart7: getCSSVariable(style, '--chart-7'),
    chart8: getCSSVariable(style, '--chart-8'),
    muted: getCSSVariable(style, '--muted'),
    accent: getCSSVariable(style, '--accent'),
    success: getCSSVariable(style, '--success', '142 71% 45%'),
    warning: getCSSVariable(style, '--warning', '38 92% 50%'),
    destructive: getCSSVariable(style, '--destructive'),
    background: getCSSVariable(style, '--background'),
    foreground: getCSSVariable(style, '--foreground'),
    border: getCSSVariable(style, '--border'),
  };
}

function getCSSVariable(style: CSSStyleDeclaration, name: string, fallback: string = '0 0% 50%'): string {
  const value = style.getPropertyValue(name).trim();
  return value || fallback;
}
