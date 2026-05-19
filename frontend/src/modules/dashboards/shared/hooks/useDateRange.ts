import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { DateRange, DateRangePreset } from '../utils/dateRange';
import { getDateRangeFromPreset, getPreviousRange } from '../utils/dateRange';

const STORAGE_KEY = 'dashboard-date-range';

export interface DateRangeState {
  range: DateRange;
  previousRange: DateRange | null;
  compare: boolean;
}

export interface UseDateRangeReturn extends DateRangeState {
  setRange: (range: DateRange) => void;
  setPreset: (preset: DateRangePreset) => void;
  setCompare: (compare: boolean) => void;
  reset: () => void;
}

/**
 * Hook to manage global date range and compare mode with URL and localStorage persistence
 */
export function useDateRange(): UseDateRangeReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [state, setState] = useState<DateRangeState>(() => {
    // Try to restore from URL first, then localStorage, then default
    const urlPreset = searchParams.get('range') as DateRangePreset | null;
    const urlCompare = searchParams.get('compare') === 'true';
    
    if (urlPreset) {
      const range = getDateRangeFromPreset(urlPreset);
      return {
        range,
        previousRange: urlCompare ? getPreviousRange(range) : null,
        compare: urlCompare,
      };
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const range: DateRange = {
          from: new Date(parsed.range.from),
          to: new Date(parsed.range.to),
          preset: parsed.range.preset,
        };
        return {
          range,
          previousRange: parsed.compare ? getPreviousRange(range) : null,
          compare: parsed.compare,
        };
      }
    } catch {
      // Ignore localStorage errors - empty catch is intentional
    }

    // Default to 30 days
    const range = getDateRangeFromPreset('30d');
    return {
      range,
      previousRange: null,
      compare: false,
    };
  });

  // Persist to URL and localStorage
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (state.range.preset) {
      params.set('range', state.range.preset);
    } else {
      params.set('range', 'custom');
      params.set('from', state.range.from.toISOString());
      params.set('to', state.range.to.toISOString());
    }
    
    if (state.compare) {
      params.set('compare', 'true');
    } else {
      params.delete('compare');
    }

    setSearchParams(params, { replace: true });

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        range: {
          from: state.range.from.toISOString(),
          to: state.range.to.toISOString(),
          preset: state.range.preset,
        },
        compare: state.compare,
      }));
    } catch {
      // Ignore localStorage errors - empty catch is intentional
    }
  }, [state, searchParams, setSearchParams]);

  const setRange = useCallback((range: DateRange) => {
    setState(prev => ({
      range,
      previousRange: prev.compare ? getPreviousRange(range) : null,
      compare: prev.compare,
    }));
  }, []);

  const setPreset = useCallback((preset: DateRangePreset) => {
    const range = getDateRangeFromPreset(preset);
    setState(prev => ({
      range,
      previousRange: prev.compare ? getPreviousRange(range) : null,
      compare: prev.compare,
    }));
  }, []);

  const setCompare = useCallback((compare: boolean) => {
    setState(prev => ({
      ...prev,
      previousRange: compare ? getPreviousRange(prev.range) : null,
      compare,
    }));
  }, []);

  const reset = useCallback(() => {
    const range = getDateRangeFromPreset('30d');
    setState({
      range,
      previousRange: null,
      compare: false,
    });
  }, []);

  return {
    ...state,
    setRange,
    setPreset,
    setCompare,
    reset,
  };
}
