import { useEffect, useState } from 'react';
import type { ProjectStatus } from '../../domain/models/ProjectsAnalytics';

export interface ProjectsFilters {
  team: string[];
  owner: string[];
  status: ProjectStatus[];
}

const STORAGE_KEY = 'dash.projects.filters';

function readQueryParamArray(param: string): string[] {
  const sp = new URLSearchParams(window.location.search);
  const raw = sp.get(param);
  return raw ? raw.split(',').filter(Boolean) : [];
}

function writeQueryParams(filters: ProjectsFilters) {
  const sp = new URLSearchParams(window.location.search);
  const entries: Array<[keyof ProjectsFilters, string]> = [
    ['team', filters.team.join(',')],
    ['owner', filters.owner.join(',')],
    ['status', filters.status.join(',')],
  ];
  for (const [k, v] of entries) {
    if (v) sp.set(k, v);
    else sp.delete(k);
  }
  const newUrl = `${window.location.pathname}?${sp.toString()}${window.location.hash}`;
  window.history.replaceState({}, '', newUrl);
}

export function useProjectsFilters() {
  const [filters, setFilters] = useState<ProjectsFilters>(() => {
    try {
      const fromUrl: ProjectsFilters = {
        team: readQueryParamArray('team'),
        owner: readQueryParamArray('owner'),
        status: readQueryParamArray('status') as ProjectStatus[],
      };
      if (fromUrl.team.length || fromUrl.owner.length || fromUrl.status.length) {
        return fromUrl;
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored
        ? (JSON.parse(stored) as ProjectsFilters)
        : { team: [], owner: [], status: [] };
    } catch {
      return { team: [], owner: [], status: [] };
    }
  });

  useEffect(() => {
    writeQueryParams(filters);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setTeam = (team: string[]) => setFilters((f) => ({ ...f, team }));
  const setOwner = (owner: string[]) => setFilters((f) => ({ ...f, owner }));
  const setStatus = (status: ProjectStatus[]) => setFilters((f) => ({ ...f, status }));

  const clear = () => setFilters({ team: [], owner: [], status: [] });

  const hasFilters = filters.team.length > 0 || filters.owner.length > 0 || filters.status.length > 0;

  return {
    filters,
    setFilters,
    setTeam,
    setOwner,
    setStatus,
    clear,
    hasFilters,
  };
}
