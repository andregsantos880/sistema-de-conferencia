import type { Container } from 'inversify';
import type { AppModule } from '@/core/di/module-loader';

/**
 * No SisConf o módulo de auth não precisa registrar serviços via DI — a Auth
 * é estado simples gerenciado em `authStore.ts` + chamadas axios diretas.
 * As páginas de login/cadastro vivem no módulo `public`. Este módulo só
 * existe para preservar a estrutura esperada pelo module-loader.
 */
export function createAuthModule(_parent: Container): AppModule {
  return { name: 'auth', routes: [] };
}
