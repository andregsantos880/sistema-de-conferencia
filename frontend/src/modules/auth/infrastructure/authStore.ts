/**
 * Storage local + estado em memória do usuário autenticado.
 * Compartilhado pelo cliente axios (request interceptor) e por componentes via hook useAuth.
 */

export type Tokens = {
  accessToken: string;
  accessTokenExpiraEm: string;
  refreshToken: string;
  refreshTokenExpiraEm: string;
};

export type UsuarioAutenticado = {
  usuarioId: string;
  tenantId: string;
  email: string;
  nome: string;
  ehOwner: boolean;
  permissoes: string[];
  tokens: Tokens;
};

const ACCESS_KEY = import.meta.env.VITE_AUTH_ACCESS_TOKEN_KEY ?? 'sisconf_access_token';
const REFRESH_KEY = import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY ?? 'sisconf_refresh_token';
const USER_KEY = import.meta.env.VITE_AUTH_CURRENT_USER_KEY ?? 'sisconf_current_user';

type Listener = (u: UsuarioAutenticado | null) => void;
const listeners = new Set<Listener>();
let memoria: UsuarioAutenticado | null = restaurar();

function restaurar(): UsuarioAutenticado | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  const access = localStorage.getItem(ACCESS_KEY);
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!raw || !access || !refresh) return null;
  try {
    const parsed = JSON.parse(raw) as Omit<UsuarioAutenticado, 'tokens'> & { tokens?: Tokens };
    return {
      ...parsed,
      tokens: parsed.tokens ?? {
        accessToken: access,
        accessTokenExpiraEm: '',
        refreshToken: refresh,
        refreshTokenExpiraEm: '',
      },
    } as UsuarioAutenticado;
  } catch {
    return null;
  }
}

function persistir(u: UsuarioAutenticado) {
  localStorage.setItem(ACCESS_KEY, u.tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, u.tokens.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

export const authStore = {
  set(payload: Partial<UsuarioAutenticado> & { tokens: Tokens; usuarioId: string; tenantId: string; email: string; nome: string; ehOwner?: boolean; permissoes?: string[] }) {
    const atual: UsuarioAutenticado = {
      usuarioId: payload.usuarioId,
      tenantId: payload.tenantId,
      email: payload.email,
      nome: payload.nome,
      ehOwner: payload.ehOwner ?? memoria?.ehOwner ?? false,
      permissoes: payload.permissoes ?? memoria?.permissoes ?? [],
      tokens: payload.tokens,
    };
    memoria = atual;
    persistir(atual);
    listeners.forEach((l) => l(atual));
  },
  clear() {
    memoria = null;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    listeners.forEach((l) => l(null));
  },
  get(): UsuarioAutenticado | null { return memoria; },
  getAccessToken(): string | null { return memoria?.tokens.accessToken ?? null; },
  getRefreshToken(): string | null { return memoria?.tokens.refreshToken ?? null; },
  estaAutenticado(): boolean { return memoria !== null; },
  temPermissao(codigo: string): boolean {
    if (!memoria) return false;
    if (memoria.permissoes.includes(codigo)) return true;
    const modulo = codigo.split('.')[0];
    return memoria.permissoes.includes(`${modulo}.*`);
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
