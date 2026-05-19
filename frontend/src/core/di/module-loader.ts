import { Container } from 'inversify';
import type { ModuleRoute } from '@/core/router/types';
import { createAuthModule } from '@/modules/auth/di/container';
import { createPublicModule } from '@/modules/public/di/container';
import { createSystemModule } from '@/modules/system/di/container';
import { createConferenciaModule } from '@/modules/conferencia/di/container';
import { createPedidosModule } from '@/modules/pedidos/di/container';
import { createImportacoesModule } from '@/modules/importacoes/di/container';
import { createCadastrosModule } from '@/modules/cadastros/di/container';
import { createHistoricoModule } from '@/modules/historico/di/container';
import { createRelatoriosModule } from '@/modules/relatorios/di/container';
import { createBillingModule } from '@/modules/billing/di/container';
import { createAdminModule } from '@/modules/admin/di/container';

export interface AppModule {
  name: string;
  routes: ModuleRoute[];
  registerBindings?: () => void;
}

export interface ModuleRegistry {
  modules: Map<string, AppModule>;
  container: Container;
  registerModule: (module: AppModule) => void;
  getModule: (name: string) => AppModule | undefined;
  getAllRoutes: () => ModuleRoute[];
  getRouteBehavior: (pathname: string) => import('@/shared/ui/layouts/behaviors').LayoutBehavior;
}

export function createModuleRegistry(container: Container): ModuleRegistry {
  const modules = new Map<string, AppModule>();
  const registerModule = (module: AppModule) => {
    modules.set(module.name, module);
    if (module.registerBindings) module.registerBindings();
  };

  const getModule = (name: string) => modules.get(name);
  const getAllRoutes = () => Array.from(modules.values()).flatMap(m => m.routes);

  const getRouteBehavior = (pathname: string): import('@/shared/ui/layouts/behaviors').LayoutBehavior => {
    const allRoutes = getAllRoutes();
    const matchRoute = (routePath: string, targetPath: string): boolean => {
      if (routePath.endsWith('/*')) return targetPath.startsWith(routePath.slice(0, -2));
      const a = routePath.split('/'); const b = targetPath.split('/');
      if (a.length !== b.length) return false;
      return a.every((part, i) => part.startsWith(':') || part === b[i]);
    };
    const findBehavior = (routes: ModuleRoute[]): import('@/shared/ui/layouts/behaviors').LayoutBehavior | null => {
      for (const r of routes) {
        if (matchRoute(r.path, pathname)) return r.layoutBehavior ?? 'default';
        if (r.children) {
          const c = findBehavior(r.children);
          if (c) return c;
        }
      }
      return null;
    };
    return findBehavior(allRoutes) ?? 'default';
  };

  return { modules, container, registerModule, getModule, getAllRoutes, getRouteBehavior };
}

export function loadAllModules(container: Container): ModuleRegistry {
  const registry = createModuleRegistry(container);
  const modules = [
    createPublicModule,
    createAuthModule,
    createSystemModule,
    createConferenciaModule,
    createPedidosModule,
    createImportacoesModule,
    createCadastrosModule,
    createHistoricoModule,
    createRelatoriosModule,
    createBillingModule,
    createAdminModule,
  ];
  modules.map(fn => fn(container)).forEach(m => registry.registerModule(m));
  return registry;
}
