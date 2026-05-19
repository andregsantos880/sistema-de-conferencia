import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { moduleRegistry } from '@/core/di/container';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '@/app/layout/AppLayout';
import type { ModuleRoute } from '@/core/router/types';

const Loading = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500" />
  </div>
);

const NotFound = () => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold mb-2">404</h1>
    <p className="text-slate-500">Página não encontrada.</p>
  </div>
);

function renderElement(route: ModuleRoute): React.ReactElement {
  const C = route.component;
  if (!C) return <div>Rota sem componente: {route.path}</div>;
  const isLazy = typeof C === 'function' && !C.prototype?.render;
  return isLazy ? <Suspense fallback={<Loading />}><C /></Suspense> : <C />;
}

function renderRoutes(routes: ModuleRoute[]): React.ReactElement[] {
  return routes.map((r) => {
    if (r.children && r.children.length > 0) {
      return (
        <Route key={r.path} path={r.path} element={renderElement(r)}>
          {renderRoutes(r.children)}
        </Route>
      );
    }
    return <Route key={r.path} path={r.path} element={renderElement(r)} index={r.index} />;
  });
}

const AppRouter: React.FC = () => {
  const allRoutes = moduleRegistry.getAllRoutes();
  const publicRoutes = allRoutes.filter((r) => r.layout === 'none' || r.layout === 'auth');
  const appRoutes = allRoutes.filter((r) => r.layout === 'app');

  return (
    <BrowserRouter>
      <Routes>
        {renderRoutes(publicRoutes)}

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/conferencia" replace />} />
          {renderRoutes(appRoutes)}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
