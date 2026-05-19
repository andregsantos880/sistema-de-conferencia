import { useSyncExternalStore } from 'react';
import { authStore, type UsuarioAutenticado } from './authStore';

export function useAuth(): {
  usuario: UsuarioAutenticado | null;
  estaAutenticado: boolean;
  temPermissao: (codigo: string) => boolean;
  logout: () => void;
} {
  const usuario = useSyncExternalStore(
    (cb) => authStore.subscribe(cb),
    () => authStore.get(),
    () => null
  );
  return {
    usuario,
    estaAutenticado: usuario !== null,
    temPermissao: (c) => authStore.temPermissao(c),
    logout: () => authStore.clear(),
  };
}
