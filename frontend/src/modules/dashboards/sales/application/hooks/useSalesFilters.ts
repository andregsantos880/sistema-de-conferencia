import { useEffect, useState } from 'react';

export interface SalesFilters {
  team: string[];
  region: string[];
  owner: string[];
}

const STORAGE_KEY = 'dash.sales.filters';

function readQueryParamArray(param: string): string[] {
  const sp = new URLSearchParams(window.location.search);
  const raw = sp.get(param);
  return raw ? raw.split(',').filter(Boolean) : [];
}

function writeQueryParams(filters: SalesFilters) {
  const sp = new URLSearchParams(window.location.search);
  const entries: Array<[keyof SalesFilters, string]> = [
    ['team', filters.team.join(',')],
    ['region', filters.region.join(',')],
    ['owner', filters.owner.join(',')],
  ];
  for (const [k, v] of entries) {
    if (v) sp.set(k, v); else sp.delete(k);
  }
  const newUrl = `${window.location.pathname}?${sp.toString()}${window.location.hash}`;
  window.history.replaceState({}, '', newUrl);
}

export function useSalesFilters() {
  const [filters, setFilters] = useState<SalesFilters>(() => {
    try {
      const fromUrl: SalesFilters = {
        team: readQueryParamArray('team'),
        region: readQueryParamArray('region'),
        owner: readQueryParamArray('owner'),
      };
      if (fromUrl.team.length || fromUrl.region.length || fromUrl.owner.length) return fromUrl;
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as SalesFilters) : { team: [], region: [], owner: [] };
    } catch {
      return { team: [], region: [], owner: [] };
    }
  });

  useEffect(() => {
    writeQueryParams(filters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setTeam = (team: string[]) => setFilters((f) => ({ ...f, team }));
  const setRegion = (region: string[]) => setFilters((f) => ({ ...f, region }));
  const setOwner = (owner: string[]) => setFilters((f) => ({ ...f, owner }));

  const clear = () => setFilters({ team: [], region: [], owner: [] });

  return { filters, setFilters, setTeam, setRegion, setOwner, clear };
}
